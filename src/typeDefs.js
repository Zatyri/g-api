const { gql } = require('apollo-server-express');

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
    speed: String!
    unlimited: Boolean!
    eu: Int!
    price: String!
    hasOffer: Boolean!
    active: Boolean!
    offer: String
    offerLength: Int
    bindingOffer: Boolean
    offerValue: Int
    oneTimeDiscount: Int
    equivelentSub: [Subscription]
    benefits: [String]    
    id: ID!
  }

  type NetSubscription {
    operator: Operator!
    name: String!
    type: String!    
    speed: String!    
    eu: Int
    price: String!
    hasOffer: Boolean!
    active: Boolean!
    offer: String
    offerLength: Int
    bindingOffer: Boolean
    offerValue: Int
    oneTimeDiscount: Int    
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
    allSubscriptionsWithOffer: [Subscription]!
    allActiveSubscriptions: [Subscription]!
    getSubscriptionById(id: ID!): Subscription!
    getSubscriptionByOperatorId(id: ID!): [Subscription]!
    allNetSubscriptions: [NetSubscription!]!
    allNetSubscriptionsWithOffer: [NetSubscription]!
    allActiveNetSubscriptions: [NetSubscription]!
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
      speed: String!
      unlimited: Boolean!
      eu: Int!
      price: String!
      active: Boolean!
      equivelentSub: [ID]
    ): Subscription
    modifySubscription(
      id: ID!
      operator: String
      name: String
      talk: String
      sms: String
      speed: String
      unlimited: Boolean
      eu: Int
      price: String
      active: Boolean
      equivelentSub: [ID]
      ): Subscription
    deleteSubscription(id: ID!): Subscription
    addOffer(
      id: ID!
      offer: String!
      offerLength: Int
      bindingOffer: Boolean
      offerValue: Int
      oneTimeDiscount: Int
    ): Subscription    
    removeOffer(id: ID!): Subscription
    addNetSubscription(  
      operator: String!
      name: String!
      type: String!      
      speed: String!      
      eu: Int
      price: String!
      active: Boolean!      
    ): NetSubscription
    modifyNetSubscription(
      id: ID!
      operator: String
      name: String
      type: String      
      speed: String      
      eu: Int
      price: String
      active: Boolean      
      ): NetSubscription
    deleteNetSubscription(id: ID!): NetSubscription
    addNetOffer(
      id: ID!
      offer: String!
      offerLength: Int
      bindingOffer: Boolean
      offerValue: Int
      oneTimeDiscount: Int
    ): NetSubscription    
  }
`;

module.exports = typeDefs;
