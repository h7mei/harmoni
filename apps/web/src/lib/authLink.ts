import { setContext } from "@apollo/client/link/context";
import { cache } from "./cache.js";

const ACCESS_TOKEN_KEY = "harmoni:accessToken";

export function createAuthLink(): ReturnType<typeof setContext> {
  return setContext(async (_, { headers }) => {
    const token = await cache.get<string>(ACCESS_TOKEN_KEY);
    return {
      headers: {
        ...headers,
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    };
  });
}
