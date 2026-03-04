import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { createAuthLink } from "./lib/authLink.js";

function getGraphQLUri(): string {
  const base =
    (typeof window !== "undefined" && (window as Window & { electron?: { apiUrl?: string } }).electron?.apiUrl) ||
    import.meta.env.VITE_API_URL ||
    "";
  const normalized = base.replace(/\/$/, "");
  return normalized ? `${normalized}/graphql` : "/graphql";
}

export const client = new ApolloClient({
  link: from([
    createAuthLink(),
    new HttpLink({ uri: getGraphQLUri(), credentials: "include" }),
  ]),
  cache: new InMemoryCache(),
});
