// server.js
// where your node app starts

// init project
const express = require("express");
const session = require("express-session");
const requestProxy = require("express-request-proxy");
const bodyParser = require("body-parser");
const MongoStore = require("connect-mongo")(session);
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const expressStatusMonitor = require("express-status-monitor");
const errorHandler = require("errorhandler");
const { ApolloServer } = require("apollo-server-express");
const flash = require("express-flash");

const { cache, cacheManager } = require("./src/cacheManager");

var pino = require("express-pino-logger")({
  name: 'epochs-app',
  pretty: true,
  enabled: true
});
const pug = require("pug");
require("dotenv").config();

//require('mongo-mock');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require("./config/passport");
const { isAuthenticated } = passportConfig;

// Local module imports

const context = require("./src/context");
const models = require("./src/models");
const typeDefs = require("./src/schema");
const resolvers = require("./src/resolvers");
const dataSources = require("./src/data-sources");
const loaders = require("./src/loaders");
const routes = require("./src/routes");
const {
  AppController,
  AuthController,
  
  UserController
} = require("./src/controllers");

// Run our server on a port specified in our .env file or port 4000
const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

const app = express();

/**
 * Create Express server.
 */

const db = require('./config/db')();

app.db = db;

app.isAuthenticated = isAuthenticated;

app.set("models", models);
app.use(pino);
app.use(errorHandler());

app.set("name", process.env.APP_NAME);
app.set("version", process.env.APP_VERSION);

app.locals.name = app.get("name");
app.locals.version = app.get("version");

require("express-debug")(app, { depth: 3 });

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

async function run() {
  let sessionStore;
  let dbClient;

  try {
    dbClient = db.connect(DB_HOST);
    
    sessionStore = new MongoStore({ mongooseConnection: db.connection });
    
  } catch (err) {
    console.log(err);
  }

  const sess = {
    resave: true,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 1209600000
    },
    store: sessionStore
  };

  const getSpotifyToken = user => {
    const t = user.tokens.filter(token => token.kind === "spotify");

    console.log("getSpotifyToken", t);
    return t ? t[0] : null;
  };
  app.use(express.static("public"));
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "pug");
  app.use(
    "/",
    express.static(path.join(__dirname, "public"), {
      maxAge: 31557600000
    })
  );

  if (app.get("env") === "production") {
    app.set("trust proxy", 1); // trust first proxy
    sess.cookie.secure = true; // serve secure cookies
  }


  app.use(session(sess));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
  app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
  });
  app.use((req, res, next) => {
    //res.locals.user = req.user;
    console.log("req.session", req.session);
    console.log("req.locals", req.locals);
    next();
  });
  
  
  
  // we've started you off with Express,
  // but feel free to use whatever libs or frameworks you'd like through `package.json`.
  // Apollo Server setup
  const server = new ApolloServer({
    typeDefs,
    dataSources,
    resolvers,
    context,
    engine: {
      // debugPrintReports: true,
      // The Graph Manager API key
      apiKey: process.env.ENGINE_API_KEY,
      // A tag for this specific environment (e.g. `development` or `production`).
      // For more information on schema tags/variants, see
      // https://www.apollographql.com/docs/platform/schema-registry/#associating-metrics-with-a-variant
      schemaTag: "development"
    }
  });

  // Apply the Apollo GraphQL middleware and set the path to /api
  server.applyMiddleware({ app, path: "/graphql" });
  
  
  routes(app);
  
  

  /**
  Mount All Rotes
  */
  app.get("/login", UserController.getLogin);
  app.post("/login", UserController.postLogin);
  app.get("/logout", UserController.logout);
  app.get("/account", passportConfig.isAuthenticated, UserController.getAccount);
  app.get("/forgot", UserController.getForgot);
  app.post("/forgot", UserController.postForgot);
  app.get("/reset/:token", UserController.getReset);
  app.post("/reset/:token", UserController.postReset);
  app.get("/signup", UserController.getSignup);
  app.post("/signup", UserController.postSignup);
  app.get("/me", passportConfig.isAuthenticated, (req, res) => {
    console.log(req.user);
    const { user, session } = req;
    res.send({
      user,
      session
    });
  });

  
  
 
  //Github Login
  if (process.env.GITHUB_ID) {
    app.get("/auth/github", passport.authenticate("github"));
    app.get(
      "/auth/github/callback",
      passport.authenticate("github", {
        failureRedirect: "/login"
      }),
      (req, res) => {
        res.redirect(req.session.returnTo || "/");
      }
    );
  }

  //Spotify Login
  if (process.env.SPOTIFY_ID) {
    app.get("/auth/spotify", passport.authenticate("spotify"));
    app.get(
      "/auth/spotify/callback",
      passport.authenticate("spotify", {
        failureRedirect: "/login"
      }),
      (req, res) => {
        res.redirect(req.session.returnTo || "/");
      }
    );
  }


 


  if (app.get("env") === "development") {
    app.use(function(err, req, res) {
      res.status(err.status || 500);
      res.render("error", {
        message: err.message,
        error: err
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: {}
    });
  });
  
  
  function checkLoginSignup(req, res, next) {
    console.log('Checking and redirect', req.url, req.path);
    // After successful login, redirect back to the intended page
    if (
      !req.user &&
      req.path !== "/login" &&
      req.path !== "/signup" &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)
    ) {
      
      
      req.session.returnTo = req.originalUrl;
    } else if (
      req.user &&
      (req.path === "/account" 
       || req.path.match(/^\/api/)
      || req.path.match(/^\/browse/))
    ) {
      req.session.returnTo = req.originalUrl;
    }
    next();
  }
   //app.use();

  
  
  
  
  

  // listen for requests :)
  const listener = app.listen(port, function() {
    console.log(`Your app is listening on port ${listener.address().port}`);
    console.log(
      `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
    );
  });
}

run();
