import { createServer } from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { typeDefs } from "./graphql/schema.js";
import { resolvers } from "./graphql/resolvers.js";
import { createRedisClient } from "./redis.js";

const app = express();
const httpServer = createServer(app);

const apollo = new ApolloServer({ typeDefs, resolvers });
await apollo.start();

app.use("/graphql", cors(), express.json(), expressMiddleware(apollo));

const wsServer = new WebSocketServer({ server: httpServer, path: "/ws" });
wsServer.on("connection", (ws) => {
  ws.on("message", (data) => {
    ws.send(JSON.stringify({ type: "pong", data: data.toString() }));
  });
});

const redis = await createRedisClient();

const PORT = Number(process.env.PORT) || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}/graphql`);
  console.log(`WebSocket ready at ws://localhost:${PORT}/ws`);
});
