import type { Request } from "express";
import jwt from "jsonwebtoken";
import type { User } from "@harmoni/shared";
import { logger } from "../logger.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
const JWT_ISSUER = "harmoni";

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
  iss?: string;
}

export function signAccessToken(user: { id: string; email: string; name: string }): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      iss: JWT_ISSUER,
    },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
}

export function signRefreshToken(userId: string): string {
  return jwt.sign(
    { sub: userId, type: "refresh", iss: JWT_ISSUER },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
    }) as JwtPayload;
    return decoded;
  } catch (err) {
    logger.debug({ err }, "Invalid or expired JWT");
    return null;
  }
}

export function verifyRefreshToken(token: string): { sub: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
    }) as { sub: string; type?: string };
    return decoded?.sub ? { sub: decoded.sub } : null;
  } catch (err) {
    logger.debug({ err }, "Invalid or expired refresh token");
    return null;
  }
}

export function getUserFromRequest(req: Request): User | null {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  const payload = verifyAccessToken(token);
  if (!payload) return null;

  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    createdAt: "",
    updatedAt: "",
  };
}
