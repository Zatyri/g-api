require('dotenv').config();
const { AuthenticationError } = require('apollo-server');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const config = require('./config.json');

/*
const options = {
  identityMetadata: `https://${config.metadata.authority}/${config.credentials.tenantID}/${config.metadata.version}/${config.metadata.discovery}`,
  issuer: `https://${config.metadata.authority}/${config.credentials.issuer}/${config.metadata.version}`,
  clientID: config.credentials.clientID,
  audience: config.credentials.audience,
  scope: config.resource.scope,
  applications: config.resource.applications,
  tenant: config.credentials.tenantID,
};
*/

const options = {
  identityMetadata: `https://${process.env.AUTHOROTY}/${process.env.TENANT_ID}/${process.env.VERSION }/${process.env.DISCOVERY}`,
  issuer: `https://${process.env.AUTHOROTY}/${process.env.ISSUER}/${process.env.VERSION}`,
  clientID: process.env.CLIENT_ID,
  audience: process.env.AUDIENCE,
  scope: process.env.SCOPE,
  applications: process.env.APPLICATIONS,
  tenant: process.env.TENANT_ID,
};





const validateToken = async (token, key) => {
  try {
    const decodedKey = await jwt.verify(token, key);
    return decodedKey;
  } catch (error) {
    throw new AuthenticationError(
      `Error validating token signature: ${error.message}`
    );
  }
};

const fetchKey = async (url, keyId) => {
  let identityMetadata;
  try {
    try {
      const res = await fetch(url);       
      identityMetadata = await res.json();
    } catch (error) {
      throw new AuthenticationError(
        `Unable to fetch application identity metadata ${error.message}`
      );
    }

    let res;
    try {
      res = await fetch(identityMetadata.jwks_uri);
      res = await res.json();
    } catch (error) {
      throw new AuthenticationError(
        `Unable to fetch public keys: ${error.message}`
      );
    }
    const rawPublicKey = res.keys.filter((key) => key.kid === keyId)[0].x5c[0];
    const publicKey = `-----BEGIN CERTIFICATE-----\n${rawPublicKey}\n-----END CERTIFICATE-----`;
    return publicKey.toString('utf8');
  } catch (error) {
    throw new AuthenticationError(error.message);
  }
};

const validateAudience = (decodedToken, comparableAudience) => {
  if (decodedToken.aud !== comparableAudience) {
    throw new AuthenticationError('Audience is not valid');
  }
};

const validateIssuer = (decodedToken, comparableIssuer) => {  
  if (decodedToken.iss !== comparableIssuer) {
    throw new AuthenticationError('Issuer is not valid');
  }
};

const validateTimestamp = (startTime, endTime) => {
  const time = new Date().getTime() / 1000;
  if (time < startTime) {
    throw new AuthenticationError('Token not valid yet');
  } else if (time > endTime) {
    throw new AuthenticationError(
      'Token nota valid anymore, provide new token'
    );
  }
};

const validateApplication = (applicationId, comparableAppId) => {  
  if (!comparableAppId.find((appID) => appID === applicationId)) {
    throw new AuthenticationError(
      'Token not provided from autorized application'
    );
  }
};

const validateTenant = (appTenant, acceptedTenants) => {
  if (!acceptedTenants.find((tenant) => tenant === appTenant)) {
    throw new AuthenticationError('Token not provided from valid tenant');
  }
};

const validateACR = (acr) => {
  if (acr === 0) {
    throw new AuthenticationError('User not properly autenticated');
  }
};

const validateScopes = (providedScope, validScopes) => {
  if (!validScopes.includes(providedScope)) {
    throw new AuthenticationError('Token contains invalid scopes');
  }
};

const autenticateToken = async (rawToken) => {
  let token = rawToken;
  if (rawToken.toLowerCase().startsWith('bearer')) {
    token = token.substring(7);
  }
  const decodedToken = jwt.decode(token);  
  try {
    if(!decodedToken) throw new AuthenticationError('No valid token provided')
    validateTimestamp(decodedToken.nbf, decodedToken.exp);
    validateACR(decodedToken.acr);
    validateApplication(decodedToken.azp, [options.applications]);
    validateAudience(decodedToken, options.audience);
    validateIssuer(decodedToken, options.issuer);
    validateTenant(decodedToken.tid, [options.tenant]);
    validateScopes(decodedToken.scp, options.scope);
    const key = await fetchKey(
      options.identityMetadata,
      jwt.decode(token, { complete: true }).header.kid
    );
    const tokenToReturn = await validateToken(token, key);
    return tokenToReturn;
  } catch (error) {
    throw new AuthenticationError(error.message);
  }
};

module.exports = autenticateToken;
