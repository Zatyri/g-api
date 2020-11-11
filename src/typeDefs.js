const { gql } = require("apollo-server");

const typeDefs = gql`
  type User {
    name: String!
    username: String!
    type: String!
    store: Int!
    id: ID!    
  }

  type Token {
    value: String
  }

  type Query {
    allUsers: [User!]!
    getUserById(id: ID!): User
    getUserByUsername(username: String!): User
    me: User
  }

  type Mutation {
    addUser(
      name: String!
      username: String!
      type: String!
      store: Int! 
      password: String!     
    ): User
    updateUser(
      id: ID!
      name: String!
      type: String!
      store: Int!
    ): User
    deleteUser(
      id: ID!
      store: Int!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
`;

 module.exports = typeDefs;