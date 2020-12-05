const { AuthenticationError } = require('apollo-server');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const config = require('./config.json');

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
  let res;
  try {    
    res = await fetch(url);
    res = await res.json();   
  } catch (error) {
    throw new AuthenticationError(
      `Unable to fetch public keys: ${error.message}`
    );
  }
  
  const rawPublicKey = res.keys.filter((key) => key.kid === keyId)[0].x5c[0];
  const publicKey = `-----BEGIN CERTIFICATE-----\n${rawPublicKey}\n-----END CERTIFICATE-----`;
  return publicKey.toString('utf8');
};

const validateAudience = (decodedToken, comparableAudience) => {
  console.log(decodedToken.aud);
  
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
  if(time < startTime){
    throw new AuthenticationError('Token not valid yet')
  } else if (time > endTime){
    throw new AuthenticationError('Token nota valid anymore, provide new token')
  }
};

const validateApplication = (applicationId, comparableAppId) => {

  if(!comparableAppId.find(appID => appID === applicationId)){
    throw new AuthenticationError('Token not provided from autorized application')
  }
}

const validateTenant = (appTenant, acceptedTenants) => {
  if(!acceptedTenants.find(tenant => tenant === appTenant)){
    throw new AuthenticationError('Token not provided from valid tenant')
  }
}

const validateACR = (acr) => {
  if(acr === 0){
    throw new AuthenticationError('User not properly autenticated')
  }
}

const validateScopes = (providedScope, validScopes) => {
  if(!validScopes.find(scope => scope === providedScope)){
    throw new AuthenticationError('Token contains invalid scopes')
  }
}

const autenticateToken = async (rawToken) => {
  let token = rawToken
  if(rawToken.toLowerCase().startsWith('bearer')){
    token = token.substring(7)
  }
  const decodedToken = jwt.decode(token)
  try {
    validateTimestamp(decodedToken.nbf, decodedToken.exp);
  validateACR(decodedToken.acr)
  validateApplication(decodedToken.appid, config.allowed_applications.applications)
  validateAudience(decodedToken, config.credentials.audience)
  validateIssuer(decodedToken, config.credentials.issuer)
  validateTenant(decodedToken.tid, config.credentials.tenantID)
  validateScopes(decodedToken.scp, config.resource.scope)
  const key = await fetchKey(config.keys.public_key_uri, jwt.decode(token,{complete: true}).header.kid)
  const tokenToReturn = await validateToken(token, key)
  return tokenToReturn
} catch (error) {
    throw new AuthenticationError(error.message)
    }


}



exports.autenticateToken = autenticateToken;
