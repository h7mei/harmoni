import type { Request, Response } from "express";
import { sql } from "drizzle-orm";
import { db } from "../db/index.js";

export function healthHandler(redis: { ping: () => Promise<string> }) {
  return async (_req: Request, res: Response) => {
    const checks: Record<string, string> = {};
    let status: "ok" | "degraded" = "ok";

    try {
      await db.execute(sql`SELECT 1`);
      checks.database = "ok";
    } catch (_err) {
      checks.database = "error";
      status = "degraded";
    }

    try {
      await redis.ping();
      checks.redis = "ok";
    } catch (_err) {
      checks.redis = "error";
      status = "degraded";
    }

    const code = status === "ok" ? 200 : 503;
    res.status(code).json({
      status,
      timestamp: new Date().toISOString(),
      checks,
    });
  };
}
