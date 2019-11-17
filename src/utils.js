const rp = require("request-promise");


const log = require('pino')({name: 'utils'})
let { SPOTIFY_TOKEN } = process.env;

function getToken() {
  console.log('getToken');
  var options = {
    method: "POST",
    url: "https://accounts.spotify.com/api/token",
    json: true,
    headers: {
      Authorization:
        "Basic N2UzZTE2ZTZkOGNlNDc1Mzk2ZGY3NGM0OTdkOWJjYmE6YTJkMTk2ZjI2NDk4NGYxMjhkNTAwM2UyMzYwMWIyZGY="
    },
    form: {
      grant_type: "client_credentials"
    }
  };

  return rp(options);
}

async function searchSpotify({ access_token, q, type = "artist,track" }) {
  console.log('searchSpotify');
  let res;
  
  if(!access_token){
    try {
      res = await getToken();
      console.log('token', res);
      
    } catch (err){
      console.error('err', err);
    }
  }
  
  var options = {
    method: "GET",
    json: true,
    url: "https://api.spotify.com/v1/search",
    qs: { q, type },
    headers: {
      Authorization: "bearer ${access_token}"
    }
  };

  return await rp(options);
}

module.exports = {
  getToken,
  searchSpotify
};