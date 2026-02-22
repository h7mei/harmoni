import { get, set, del } from "idb-keyval";

const PREFIX = "harmoni:";

export const cache = {
  async get<T>(key: string): Promise<T | undefined> {
    return get<T>(`${PREFIX}${key}`);
  },
  async set<T>(key: string, value: T): Promise<void> {
    await set(`${PREFIX}${key}`, value);
  },
  async del(key: string): Promise<void> {
    await del(`${PREFIX}${key}`);
  },
};
