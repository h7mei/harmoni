import { createServer } from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { WebSocketServer } from "ws";
import depthLimit from "graphql-depth-limit";
import { typeDefs } from "./graphql/schema.js";
import { resolvers } from "./graphql/resolvers.js";
import { createContext } from "./graphql/context.js";
import { createRedisClient } from "./redis.js";
import { healthHandler } from "./routes/health.js";
import { requestIdMiddleware } from "./middleware/requestId.js";
import { verifyAccessToken } from "./middleware/auth.js";
import { logger } from "./logger.js";

const app = express();
const httpServer = createServer(app);

const apollo = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [depthLimit(Number(process.env.GRAPHQL_MAX_DEPTH) || 10) as import("graphql").ValidationRule],
  formatError: (formattedError) => {
    logger.error({ err: formattedError }, "GraphQL error");
    if (process.env.NODE_ENV === "production") {
      return {
        message: formattedError.message,
        extensions: { code: formattedError.extensions?.code },
      };
    }
    return formattedError;
  },
});

await apollo.start();

const redis = await createRedisClient();

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:3000", "http://127.0.0.1:3000"];

app.use(helmet({ contentSecurityPolicy: process.env.NODE_ENV === "production" }));
app.use(requestIdMiddleware);
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  // Use RedisStore in production for multi-instance: new RedisStore({ sendCommand: (...a) => redis.sendCommand(a), prefix: "rl:" })
});
app.use("/graphql", limiter);

app.use(
  "/graphql",
  cors({ origin: allowedOrigins, credentials: true }),
  expressMiddleware(apollo, {
    context: createContext,
  })
);

app.get("/health", healthHandler(redis));

const wsServer = new WebSocketServer({ server: httpServer, path: "/ws" });
wsServer.on("connection", (ws: import("ws").WebSocket, req: import("http").IncomingMessage) => {
  const url = new URL(req.url ?? "", `http://${req.headers.host}`);
  const token = url.searchParams.get("token");
  if (token) {
    const payload = verifyAccessToken(token);
    if (payload) {
      (ws as unknown as { userId?: string }).userId = payload.sub;
    }
  }
  ws.on("message", (data: import("ws").RawData) => {
    ws.send(JSON.stringify({ type: "pong", data: data.toString() }));
  });
});

const PORT = Number(process.env.PORT) || 4000;

const server = httpServer.listen(PORT, () => {
  logger.info(
    { port: PORT, env: process.env.NODE_ENV },
    `Server ready at http://localhost:${PORT}/graphql`
  );
  logger.info(`WebSocket ready at ws://localhost:${PORT}/ws`);
  logger.info(`Health at http://localhost:${PORT}/health`);
});

async function gracefulShutdown(signal: string) {
  logger.info({ signal }, "Received shutdown signal");
  server.close(() => {
    logger.info("HTTP server closed");
  });
  await redis.quit();
  process.exit(0);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
