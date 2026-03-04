import { ApolloClient, InMemoryCache, HttpLink, from, split } from "@apollo/client";
import { createAuthLink } from "./lib/authLink.js";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { cache } from "./lib/cache.js";

const ACCESS_TOKEN_KEY = "harmoni:accessToken";

function getGraphQLUri(): string {
  const base =
    (typeof window !== "undefined" && (window as Window & { electron?: { apiUrl?: string } }).electron?.apiUrl) ||
    import.meta.env.VITE_API_URL ||
    "";
  const normalized = base.replace(/\/$/, "");
  return normalized ? `${normalized}/graphql` : "/graphql";
}

function getGraphQLWsUri(): string {
  const base =
    (typeof window !== "undefined" && (window as Window & { electron?: { apiUrl?: string } }).electron?.apiUrl) ||
    import.meta.env.VITE_API_URL ||
    "";
  const normalized = (base || (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/$/, "");
  const httpOrigin = normalized || "http://localhost:4000";
  const wsOrigin = httpOrigin.replace(/^http/, "ws");
  return `${wsOrigin}/graphql-ws`;
}

const wsClient =
  typeof window !== "undefined"
    ? createClient({
        url: getGraphQLWsUri(),
        connectionParams: async () => {
          const token = await cache.get<string>(ACCESS_TOKEN_KEY);
          return token ? { authorization: `Bearer ${token}` } : {};
        },
      })
    : null;

const wsLink = wsClient ? new GraphQLWsLink(wsClient) : null;

const httpLink = new HttpLink({ uri: getGraphQLUri(), credentials: "include" });

const link = wsLink
  ? split(
      ({ query }) => {
        const def = getMainDefinition(query);
        return def.kind === "OperationDefinition" && def.operation === "subscription";
      },
      wsLink,
      from([createAuthLink(), httpLink])
    )
  : from([createAuthLink(), httpLink]);

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
