export const resolvers = {
  Query: {
    health: () => "ok",
  },
  Mutation: {
    ping: () => "pong",
  },
};
