const express = require("express");
const AppController = require("./controllers/app-controller");

const playlistRouter = require('./playlists/router');
module.exports = app => {
  const router = express.Router();

  var myLogger = function(req, res, next) {
    console.log("myLogger", req.session.id);
    next();
  };

  //router.use(myLogger);
  router.get("/", AppController.index);
  router.get("/browse/:id?", AppController.browse);
  
  app.use(router);
  
  playlistRouter(app);

  return app;
};
