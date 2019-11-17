const express = require("express");
const bodyParser = require("body-parser");
const PlaylistsController = require("./controller");
const loaders = require("../loaders");

//router.js
module.exports = function(app) {
  const { isAuthenticated } = app;
  /**
  
   Playlists Router
  */

  const playlistRouter = express.Router();
  playlistRouter.use(bodyParser.json());

  playlistRouter.use(isAuthenticated, function(req, res, next) {
    if (!req.loaders) {
      req.loaders = {};
    }
    if (req.user) {
      const [{ accessToken }] = req.user.tokens.filter(
        t => t.kind === "spotify"
      );
      if (req.loaders && !req.loaders.spotify) {
        req.loaders.spotify = loaders.createLoaders(accessToken);
      }
      console.log(req.user.tokens, accessToken);
    }
    console.log("playlists", req.url);
    next();
  });

  playlistRouter.get("/epocs/:username", PlaylistsController.getByUsername);

  playlistRouter.get("/playlists/:id?", PlaylistsController.get);
  playlistRouter.put(
    "/playlists/:id",
    bodyParser.json(),
    PlaylistsController.put
  );
  playlistRouter.delete("/playlists/:id", PlaylistsController.delete);
  playlistRouter.post(
    "/playlists",
    bodyParser.json(),
    PlaylistsController.post
  );

  app.use(playlistRouter);
};
