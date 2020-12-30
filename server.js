console.log('started');

require('dotenv').config();
const express = require('express');
const { ApolloServer, AuthenticationError } = require('apollo-server-express');
const mongoose = require('mongoose');

const typeDefs = require('./src/typeDefs');
const resolvers = require('./src/resolvers');
const logger = require('./middleware/logger');
const autenticateToken = require('./tokenValidation');

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
    logger('connected to MongoDB');
  } catch (error) {
    logger(error.message);
  }
};
connectDB();

const app = express();
app.use(express.static('build'));

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const auth = req ? req.headers.authorization : null;
      if (auth && auth.toLowerCase().startsWith('bearer ')) {
        const allowedAccess = {
          role: null,
          scopes: null,
        };
        try {
          const decodedToken = await autenticateToken(auth);
          if (decodedToken) {
            allowedAccess.role = decodedToken.roles[0];
            allowedAccess.scopes = decodedToken.scp;
          }
        } catch (error) {
          logger(error.message);
        }

        return allowedAccess;
      } else {
        throw new AuthenticationError('no token provided');
      }
    },
  });

  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;

  try {
    await app.listen(PORT, () =>
      console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`)
    );
  } catch (error) {
    logger(error.message);
  }
};
startServer();
