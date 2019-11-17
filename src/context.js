const models = require('./models');
const { cache } = require('./cacheManager');
const { getToken } = require('./utils');


const getCachedToken = (id, cb) => {
  return cache.wrap(id, (cacheCallback) => getToken().then(cacheCallback))
};


module.exports = async ({req}) => {
  const { user, session } = req;
  
  let { spotifyToken } = session;  
  
  
  if(!spotifyToken){
    let tokenRes = await getCachedToken(session.id);
    console.log('tokenResponse', tokenRes);
    spotifyToken = `${tokenRes.token_type} ${tokenRes.access_token}`;
    req.session.spotifyToken = spotifyToken;
  }
  
  console.log('context', req.url, req.session, spotifyToken);
  
    
    
    return { 
      models, 
      user, 
      session,
      spotifyToken
    };
  };