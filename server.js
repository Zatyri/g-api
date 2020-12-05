require('dotenv').config();
const express = require('express');
const { ApolloServer, AuthenticationError } = require('apollo-server-express');
const BearerStrategy = require('passport-azure-ad').BearerStrategy;
const passport = require('passport');

const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const typeDefs = require('./src/typeDefs');
const resolvers = require('./src/resolvers');
const logger = require('./middleware/logger');
const config = require('./config');
const autenticateToken = require('./tokenValidation')


const MONGODB_URI = process.env.MONGODB_URI;

const options = {
  identityMetadata: `https://${config.metadata.authority}/${config.credentials.tenantID}/${config.metadata.version}/${config.metadata.discovery}`,
  issuer: `https://${config.metadata.authority}/${config.credentials.tenantID}/${config.metadata.version}`,
  clientID: config.credentials.clientID,
  audience: config.credentials.audience,
  validateIssuer: config.settings.validateIssuer,
  passReqToCallback: config.settings.passReqToCallback,
  loggingLevel: config.settings.loggingLevel,
  scope: config.resource.scope,
};

const bearerStrategy = new BearerStrategy(options, (token, done) => {
  done(null, {roles}, token);
});

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
app.use(passport.initialize());
passport.use(bearerStrategy);

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const auth = req ? req.headers.authorization : null;
      if (auth && auth.toLowerCase().startsWith('bearer ')) {
        const token = jwt.decode(auth.substring(7), { complete: true });
        /*
        console.log(token);
        console.log(auth.substring(7));
*/
        try {
          /*

                    
            if(token.payload.aud !== process.env.AUDIENCE){
              throw new AuthenticationError('Väärä aud')
            }
            if(token.payload.iss !== 'https://sts.windows.net/fbedf638-3b69-42dd-9391-4e789848f191/'){
              throw new AuthenticationError('Väärä iss')
            }
            */
            
            

          //passport.authenticate('oauth-bearer')(null, auth,);
          /*
          const moi = await tokenValidation.fetchKey(config.keys.public_key_uri, "kg2LYs2T0CTjIfj4rt6JIynen38")
            console.log(moi);
*/


const moi = await autenticateToken.autenticateToken(auth)
         console.log(moi);
         
const key = '-----BEGIN CERTIFICATE-----\nMIIDBTCCAe2gAwIBAgIQQiR8gZNKuYpH6cP+KIE5ijANBgkqhkiG9w0BAQsFADAtMSswKQYDVQQDEyJhY2NvdW50cy5hY2Nlc3Njb250cm9sLndpbmRvd3MubmV0MB4XDTIwMDgyODAwMDAwMFoXDTI1MDgyODAwMDAwMFowLTErMCkGA1UEAxMiYWNjb3VudHMuYWNjZXNzY29udHJvbC53aW5kb3dzLm5ldDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMkymupuRhTpZc+6CBxQpL0SaAb+8CzLiiDyx2xRoecjojvKN2pKKjIX9cejMSDRoWaOnZCK4VZVX1iYRCWT1WkHb8r1ZpSGa7oXG89zxjKjwG46tiamwdZjJ7Mhh8fqLz9ApucY/LICPMJuu6d56LKs6hb4OpjylTvsNUAa+bHg1NgMFNg0fPCxdr9N2Y4J+Jhrz3VDl4oU0KDZX/pyRXblzA8kYGWm50dh5WB4WoB8MtW3lltVrRGj8/IgTf9GxpBsO9OWgwVByZHU7ctZs7AmUbq/59Ipql7vSM6EsoquXdMiq0QOcZAPitwzHkTKrmeULz0/RHnuBGXxS/e8wX0CAwEAAaMhMB8wHQYDVR0OBBYEFGcWXwaqmO25Blh2kHHAFrM/AS2CMA0GCSqGSIb3DQEBCwUAA4IBAQDFnKQ98CBnvVd4OhZP0KpaKbyDv93PGukE1ifWilFlWhvDde2mMv/ysBCWAR8AGSb1pAW/ZaJlMvqSN/+dXihcHzLEfKbCPw4/Mf2ikq4gqigt5t6hcTOSxL8wpe8OKkbNCMcU0cGpX5NJoqhJBt9SjoD3VPq7qRmDHX4h4nniKUMI7awI94iGtX/vlHnAMU4+8y6sfRQDGiCIWPSyypIWfEA6/O+SsEQ7vZ/b4mXlghUmxL+o2emsCI1e9PORvm5yc9Y/htN3Ju0x6ElHnih7MJT6/YUMISuyob9/mbw8Vf49M7H2t3AE5QIYcjqTwWJcwMlq5i9XfW2QLGH7K5i8\n-----END CERTIFICATE-----'
          
            //console.log(key.toString('utf8'));
            
          const test = jwt.verify(auth.substring(7), key.toString('utf8'))
           // console.log(test);
          return token.payload.roles;
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
      console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
    );
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
