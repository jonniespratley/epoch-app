const DataLoader = require('dataloader');
const rp = require('request-promise');
const User = require('./models/user');


async function spotifyAPIRequest({accessToken, resource, id, sub, query}){
  const url = `https://api.spotify.com/v1/${resource}/${id}/${sub}`;
  console.log('request', url);
  
  return rp({
      url,
      json: true,
      qs: query,
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    })
}
function genLoaders(accessToken, ids) {
  console.log('Create loaders for ', accessToken, ids);
  let out = [];
  out = [...ids].map(id => spotifyAPIRequest({
    accessToken, 
    resource: 'users', 
    id, 
    sub: 'playlists'
  }))
  return Promise.all(out);
}

function createLoaders(authToken) {
  return {
    playlists: new DataLoader(ids => genLoaders(authToken, ids)),
  }
}



async function getUser(email){
  console.log('Get User', email);
  return User.findOne({email})  
}
module.exports = {
  getUser, 
  createLoaders,
  genLoaders
}


/*
(async function main(){
  const token = 'BQCCb3jjOyblcTrNmsxlx-pF9Lu5yivTx4ckl8xGnGWdAUe-ZJvKfANJ73dV8IrwHeopjf4WdJY1_jlVWUY6Dluv86mpcsG3bSFLnFqGpvKyXdyGcJqPGsWfiXHUmKM92AORwp3S32eup1fBs_ms5XRnR3M0xIVjfZa4_RtGRzD_ppIWX4cQ';
  const loaders = createLoaders(token);
  
  // const data = await loaders.playlists.load('shawnsakamoto');
  
  
  const d = data.items.map(o => new EpochModel(o));
  console.log(JSON.stringify(d, null, 2));
  
const mongoose = require('mongoose');
 mongoose.connect(process.env.MONGODB_URI);
 mongoose.connection.on('error', (err) => {
   console.error(err);
   console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
   process.exit();
 });
  
  const Epoch = require('../models/Epoch');
  const item = new Epoch({name: 'Test 1'});
  item.user = '5d4caa97241678c45e73656b';
    console.log(item);
const res = await item.save();
console.log('result', res);
})()
*/