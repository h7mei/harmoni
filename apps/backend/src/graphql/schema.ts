export const typeDefs = `#graphql
  type Query {
    health: String!
  }

  type Mutation {
    ping: String!
  }

  type Subscription {
    updates: String!
  }
`;
