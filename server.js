require("dotenv").config();
const { ApolloServer } = require("apollo-server");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const typeDefs = require("./src/typeDefs");
const resolvers = require("./src/resolvers");
const logger = require("./middleware/logger");

const User = require("./models/user");

const MONGODB_URI = process.env.MONGODB_URI;

logger(`connecting to ${MONGODB_URI}`);

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    logger("connected to MongoDB");
  } catch (error) {
    logger(error.message);
  }
};
connectDB();

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const auth = req ? req.headers.authorization : null;
      if (auth && auth.toLowerCase().startsWith("bearer ")) {
        const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET);
        const currentUser = await User.findById(decodedToken.id);
        return { currentUser };
      }
    },
  });
  try {
    const { url } = await server.listen();
    logger(`Server running at ${url}`);
  } catch (error) {
    logger(error.message);
  }
};
startServer();
