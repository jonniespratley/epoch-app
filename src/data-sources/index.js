const rp = require('request-promise');
const { RESTDataSource } = require('apollo-datasource-rest');
const { SPOTIFY_TOKEN } = process.env;

class SpotifyAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = ' https://api.spotify.com/v1';
  }
  
   willSendRequest(request) {
    request.headers.set('Content-Type', 'application/json');
    request.headers.set('Authorization', this.context.spotifyToken);
    //console.log('willSendRequest', request);
  }
  
  //	https://api.spotify.com/v1/tracks/
  async getTrack({ id }) {
    const data = await this.get(`/tracks/${id}`);
    return data;
  }

  async search({ q, type = 'track,artist', offset = 0, limit = 20 }) {
    const data = await this.get('/search', {
      q,
      type,
      offset,
      limit,
    });
   
    return data;
  }

  async getToken() {
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
};


module.exports = () => {
  return {
    spotify: new SpotifyAPI()
  }
};