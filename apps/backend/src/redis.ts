import { createClient } from "redis";

export interface RedisLike {
  sendCommand(args: string[]): Promise<unknown>;
  ping(): Promise<string>;
  quit(): Promise<void>;
}

const noopRedis: RedisLike = {
  sendCommand: async () => undefined,
  ping: async () => "PONG",
  quit: async () => {},
};

export async function createRedisClient(): Promise<RedisLike> {
  const url = process.env.REDIS_URL ?? "redis://localhost:6379";
  try {
    const client = await createClient({ url }).connect();
    client.on("error", (err) => console.error("Redis error:", err));
    return client as unknown as RedisLike;
  } catch (err) {
    console.warn("Redis unavailable, running without rate-limit store:", (err as Error).message);
    return noopRedis;
  }
}
