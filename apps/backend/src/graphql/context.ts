import type { User } from "@harmoni/shared";
import type { Logger } from "@harmoni/shared";
import type { Request } from "express";
import { getUserFromRequest } from "../middleware/auth.js";
import { logger as baseLogger } from "../logger.js";

export interface GraphQLContext {
  user: User | null;
  requestId: string;
  logger: Logger;
}

export async function createContext({
  req,
}: {
  req: Request;
}): Promise<GraphQLContext> {
  const requestId =
    (req.headers["x-request-id"] as string) ??
    `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  const user = getUserFromRequest(req);

  const logger = baseLogger.child({
    requestId,
    userId: user?.id ?? undefined,
  });

  return {
    user,
    requestId,
    logger,
  };
}
