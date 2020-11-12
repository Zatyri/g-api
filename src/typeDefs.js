const { gql } = require('apollo-server');

const typeDefs = gql`
  type User {
    name: String!
    username: String!
    type: String!
    store: Int!
    id: ID!
  }

  type Operator {
    name: String!
    id: ID!
  }

  type Subscription {
    operator: Operator!
    name: String!
    talk: String!
    sms: String!
    speed: Int!
    unlimited: Boolean!
    eu: Int!
    price: String!
    hasOffer: Boolean!
    offer: String
    offerValue: Int
    oneTimeDiscount: String
    equivelentSub: [Subscription]
    benefits: [String]
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
    allOperators: [Operator!]!
    allSubscriptions: [Subscription!]!
    getSubscriptionById(id: ID!): Subscription!
  }

  type Mutation {
    addUser(
      name: String!
      username: String!
      type: String!
      store: Int!
      password: String!
    ): User
    updateUser(id: ID!, name: String!, type: String!, store: Int!): User
    deleteUser(id: ID!, store: Int!): User
    login(username: String!, password: String!): Token
    addOperator(name: String!): Operator
    addSubscription(
      operator: String!
      name: String!
      talk: String!
      sms: String!
      speed: Int!
      unlimited: Boolean!
      eu: Int!
      price: String!
      equivelentSub: [ID]
    ): Subscription
    modifySubscription(
      id: ID!
      operator: String
      name: String
      talk: String
      sms: String
      speed: Int
      unlimited: Boolean
      eu: Int
      price: String
      equivelentSub: [ID]
      ): Subscription
    deleteSubscription(id: ID!): Subscription
    addOffer(
      id: ID!
      offer: String!
      offerValue: Int
      oneTimeDiscount: String
    ): Subscription    
    removeOffer(id: ID!): Subscription
  }
`;

module.exports = typeDefs;
