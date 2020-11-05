require('dotenv').config();
const { ApolloServer } = require("apollo-server");
const mongoose = require('mongoose');

const typeDefs = require('./src/typeDefs');
const resolvers = require('./src/resolvers');
const logger = require('./middleware/logger')

const User = require('./models/user');

const MONGODB_URI = process.env.MONGODB_URI

logger(`connecting to ${MONGODB_URI}`);

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI,  {useNewUrlParser: true, useUnifiedTopology: true})
    logger('connected to MongoDB');    
  } catch (error) {
    logger(error.message)
  }
}
connectDB();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  logger(`Server running at ${url}`);
});
