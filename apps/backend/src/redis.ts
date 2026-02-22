import { createClient } from "redis";

export function createRedisClient() {
  const url = process.env.REDIS_URL ?? "redis://localhost:6379";
  return createClient({ url }).connect().then((client) => {
    client.on("error", (err) => console.error("Redis error:", err));
    return client;
  });
}
