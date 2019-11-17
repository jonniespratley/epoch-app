/**
 * GET /epochs
 * List all Epochs.
 */

const Model = require('../models/epoch.js');

exports.getByUsername = (req, res) => {
  req.loaders.spotify.playlists.load(req.params.username).then(resp => {
    res.send(resp);
  });
};
exports.get = (req, res) => {
  console.log(req.loaders);
  const {query} = req;
  const {id} = req.params;
  if(id){
    Model.findById(id, (err, playlist) => {
      if(req.is('json')){
        return res.status(200).send({err, playlist});
      } 
      return res.render('playlists/playlist', {
        err,
        playlist
      });
    });
  }

  if(!id){
    Model.find(query, (err, playlists) => {
      if(req.is('json')){
        return res.status(200).send({err, playlists});  
      } 
      return res.render('playlists', {
        err,
        playlists
      });
      
    });
  }
};
exports.post = (req, res) => {
  console.log(req.body);
  const m = new Model(req.body);
  m.user = req.user.id;
  return m.save().then(playlist => {
    
    if(req.is('html')){
      return res.render('playlists', {
        playlist
      });
    } 
    return res.status(201).send({playlist});
  })
  
};
exports.put = (req, res) => {
  const { id } = req.params;
  Model.findByIdAndUpdate(id, req.body, ((err, doc) => {
    if(err){
      res.status(400).send({err});
    }
    res.status(200).send({doc});
  }))
};
exports.delete = (req, res) => {
  const { id } = req.params;
  Model.findByIdAndDelete(id, ((err, doc) => {
    if(err){
      res.status(400).send({err});
    }
    res.status(200).send({doc});
  }))
  
};