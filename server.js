require('dotenv').config();
const express = require('express');
const { ApolloServer, AuthenticationError } = require('apollo-server-express');
const BearerStrategy = require('passport-azure-ad').BearerStrategy;
const passport = require('passport')

const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const typeDefs = require('./src/typeDefs');
const resolvers = require('./src/resolvers');
const logger = require('./middleware/logger');

const User = require('./models/user');
const operator = require('./models/operator');

const MONGODB_URI = process.env.MONGODB_URI;

const options = {
  identityMetadata: process.env.IDENTITYMETADATA,
  issuer: process.env.ISSUER,
  clientID: process.env.OAUTH_APP_ID,
  audience: process.env.AUDIENCE,
  validateIssuer: true,
  passReqToCallback: false,
  loggingLevel: 'info',
  // scope: 'config.resource.scope'
};

const bearerStrategy = new BearerStrategy(options,
  function(token, done){    
    return done(null, token)
  })

  passport.use(bearerStrategy)

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
const corsOptions = {
  origin: 'http://localhost:4000',
  credentials: true
}

const app = express()
  
app.use(express.static('build'))
passport.use(bearerStrategy)  
app.use(passport.initialize())
app.use(passport.session())

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,    
    context: async ({ req }) => {         
        
      const auth = req ? req.headers.authorization : null;
      if (auth && auth.toLowerCase().startsWith('bearer ')) {  
          const token = jwt.decode(auth.substring(7), {complete: true})     
          
                   
          console.log(token);
           try {  

  


                    
            if(token.payload.aud !== process.env.AUDIENCE){
              throw new AuthenticationError('Väärä aud')
            }
            if(token.payload.iss !== 'https://sts.windows.net/fbedf638-3b69-42dd-9391-4e789848f191/'){
              throw new AuthenticationError('Väärä iss')
            }
            
            passport.authenticate('oauth-bearer')
            
           
           } catch (error) {
             console.log(error);
           } 
     
        
        
        /*
        const currentUser = await User.findById(decodedToken.id);        
        return { currentUser };
        */
      }
      
     
      
    },
  });


  

 
  // app.use(cors({origin: 'http://localhost:4000', credentials: true}))

  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;

  try {
    await app.listen(PORT, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`))
  } catch (error) {
    logger(error.message);
  }
};
startServer();

/*
require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server');

const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const typeDefs = require('./src/typeDefs');
const resolvers = require('./src/resolvers');
const logger = require('./middleware/logger');

const User = require('./models/user');

const MONGODB_URI = process.env.MONGODB_URI;

logger(`connecting to ${MONGODB_URI}`);


const app = express();
app.use(cors());
app.use(express.static('build'));

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

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const auth = req ? req.headers.authorization : null;
      if (auth && auth.toLowerCase().startsWith('bearer ')) {
        const decodedToken = jwt.verify(
          auth.substring(7),
          process.env.JWT_SECRET
        );
        const currentUser = await User.findById(decodedToken.id);
        return { currentUser };
      }
    },
  });

  // server.applyMiddleware({ app });

  try {
    const { url } = await server.listen();
    logger(`Server running at ${url}`);
  } catch (error) {
    logger(error.message);
  }
};
startServer();
*/