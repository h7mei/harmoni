import * as argon2 from "argon2";
import { eq, and, asc } from "drizzle-orm";
import type { GraphQLContext } from "./context.js";
import { registerSchema, loginSchema } from "@harmoni/shared";
import { db } from "../db/index.js";
import { users, refreshTokens, todos } from "../db/schema.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../middleware/auth.js";
import { pubsub, TODOS_UPDATED } from "./pubsub.js";
import type { PubSubEngine } from "graphql-subscriptions";

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

function userToGql(user: { id: string; email: string; name: string; createdAt: Date; updatedAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

function todoToGql(todo: {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: todo.id,
    title: todo.title,
    completed: todo.completed,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  };
}

export const resolvers = {
  Query: {
    health: () => "ok",
    me: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      if (!ctx.user) return null;
      const [user] = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      return user ? userToGql(user) : null;
    },
    todos: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      if (!ctx.user) return [];
      const rows = await db
        .select()
        .from(todos)
        .where(eq(todos.userId, ctx.user.id))
        .orderBy(asc(todos.createdAt));
      return rows.map(todoToGql);
    },
    todo: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      if (!ctx.user) return null;
      const [row] = await db
        .select()
        .from(todos)
        .where(and(eq(todos.id, args.id), eq(todos.userId, ctx.user!.id)))
        .limit(1);
      return row ? todoToGql(row) : null;
    },
  },
  Mutation: {
    ping: () => "pong",
    register: async (
      _: unknown,
      args: { email: string; name: string; password: string },
      ctx: GraphQLContext
    ) => {
      const parsed = registerSchema.safeParse(args);
      if (!parsed.success) {
        const msg = parsed.error.errors.map((e) => e.message).join("; ");
        throw new Error(msg);
      }
      const { email, name, password } = parsed.data;

      const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existing) {
        throw new Error("User with this email already exists");
      }

      const passwordHash = await argon2.hash(password);
      const [user] = await db
        .insert(users)
        .values({ email, name, passwordHash })
        .returning();

      if (!user) throw new Error("Failed to create user");

      const accessToken = signAccessToken({ id: user.id, email: user.email, name: user.name });
      const refreshToken = signRefreshToken(user.id);
      const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

      await db.insert(refreshTokens).values({
        userId: user.id,
        token: refreshToken,
        expiresAt,
      });

      ctx.logger.info({ userId: user.id, email: user.email }, "User registered");

      return {
        user: userToGql(user),
        accessToken,
        refreshToken,
        expiresIn: 900,
      };
    },
    login: async (
      _: unknown,
      args: { email: string; password: string },
      ctx: GraphQLContext
    ) => {
      const parsed = loginSchema.safeParse(args);
      if (!parsed.success) {
        const msg = parsed.error.errors.map((e) => e.message).join("; ");
        throw new Error(msg);
      }
      const { email, password } = parsed.data;

      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user) {
        throw new Error("Invalid email or password");
      }

      const valid = await argon2.verify(user.passwordHash, password);
      if (!valid) {
        throw new Error("Invalid email or password");
      }

      const accessToken = signAccessToken({ id: user.id, email: user.email, name: user.name });
      const refreshToken = signRefreshToken(user.id);
      const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

      await db.insert(refreshTokens).values({
        userId: user.id,
        token: refreshToken,
        expiresAt,
      });

      ctx.logger.info({ userId: user.id, email: user.email }, "User logged in");

      return {
        user: userToGql(user),
        accessToken,
        refreshToken,
        expiresIn: 900,
      };
    },
    refreshToken: async (
      _: unknown,
      args: { refreshToken: string },
      ctx: GraphQLContext
    ) => {
      const { refreshToken } = args;
      if (!refreshToken) throw new Error("Refresh token is required");

      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded?.sub) {
        throw new Error("Invalid refresh token");
      }

      const [user] = await db.select().from(users).where(eq(users.id, decoded.sub)).limit(1);
      if (!user) {
        throw new Error("User not found");
      }

      const [stored] = await db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.token, refreshToken))
        .limit(1);

      if (!stored || stored.expiresAt < new Date()) {
        throw new Error("Invalid or expired refresh token");
      }

      await db.delete(refreshTokens).where(eq(refreshTokens.id, stored.id));

      const newAccessToken = signAccessToken({
        id: user.id,
        email: user.email,
        name: user.name,
      });
      const newRefreshToken = signRefreshToken(user.id);
      const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

      await db.insert(refreshTokens).values({
        userId: user.id,
        token: newRefreshToken,
        expiresAt,
      });

      return {
        user: userToGql(user),
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900,
      };
    },
    createTodo: async (
      _: unknown,
      args: { title: string },
      ctx: GraphQLContext
    ) => {
      if (!ctx.user) throw new Error("Authentication required");
      const title = args.title.trim();
      if (!title) throw new Error("Title is required");
      const [todo] = await db
        .insert(todos)
        .values({ userId: ctx.user.id, title })
        .returning();
      if (!todo) throw new Error("Failed to create todo");
      pubsub.publish(`${TODOS_UPDATED}:${ctx.user.id}`, true);
      return todoToGql(todo);
    },
    updateTodo: async (
      _: unknown,
      args: { id: string; title?: string; completed?: boolean },
      ctx: GraphQLContext
    ) => {
      if (!ctx.user) throw new Error("Authentication required");
      const [existing] = await db
        .select()
        .from(todos)
        .where(and(eq(todos.id, args.id), eq(todos.userId, ctx.user.id)))
        .limit(1);
      if (!existing) throw new Error("Todo not found");
      const updates: { title?: string; completed?: boolean; updatedAt: Date } = {
        updatedAt: new Date(),
      };
      if (args.title !== undefined) updates.title = args.title.trim();
      if (args.completed !== undefined) updates.completed = args.completed;
      const [updated] = await db
        .update(todos)
        .set(updates)
        .where(eq(todos.id, args.id))
        .returning();
      if (!updated) throw new Error("Failed to update todo");
      pubsub.publish(`${TODOS_UPDATED}:${ctx.user.id}`, true);
      return todoToGql(updated);
    },
    deleteTodo: async (
      _: unknown,
      args: { id: string },
      ctx: GraphQLContext
    ) => {
      if (!ctx.user) throw new Error("Authentication required");
      const [existing] = await db
        .select()
        .from(todos)
        .where(and(eq(todos.id, args.id), eq(todos.userId, ctx.user.id)))
        .limit(1);
      if (!existing) return false;
      await db.delete(todos).where(eq(todos.id, args.id));
      pubsub.publish(`${TODOS_UPDATED}:${ctx.user.id}`, true);
      return true;
    },
  },
  Subscription: {
    todosUpdated: {
      subscribe: (_: unknown, __: unknown, ctx: GraphQLContext) => {
        if (!ctx.user) throw new Error("Authentication required");
        return (pubsub as PubSubEngine).asyncIterableIterator<boolean>([
          `${TODOS_UPDATED}:${ctx.user.id}`,
        ]);
      },
    },
  },
};
