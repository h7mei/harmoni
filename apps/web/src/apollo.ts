import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { createAuthLink } from "./lib/authLink.js";

const apiUrl = import.meta.env.VITE_API_URL ?? "";

export const client = new ApolloClient({
  link: from([
    createAuthLink(),
    new HttpLink({ uri: `${apiUrl}/graphql`, credentials: "include" }),
  ]),
  cache: new InMemoryCache(),
});
