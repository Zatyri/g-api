const { gql } = require("apollo-server");

const typeDefs = gql`
  type User {
    name: String!
    userName: String!
    type: String!
    store: Int!
    id: ID!
  }

  type Query {
    allUsers: [User!]!
    getUserById(id: ID!): User
  }
`;

 module.exports = typeDefs;