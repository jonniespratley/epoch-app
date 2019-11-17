//config/passport.js
const _ = require('lodash')
const passport = require('passport');
const moment = require('moment');
const refresh = require('passport-oauth2-refresh');
const { OAuth2Strategy } = require('passport-oauth');
const { Strategy: GitHubStrategy } = require('passport-github');
const { Strategy: LocalStrategy } = require('passport-local');

const { User } = require('../src/models');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});




/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  User.findOne({ email: email.toLowerCase() }, (err, user) => {
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { msg: `Email ${email} not found.` });
    }
    if (!user.password) {
      return done(null, false, { msg: 'Your account was registered using a sign-in provider. To enable password login, sign in using a provider, and then set a password under your user profile.' });
    }
    user.comparePassword(password, (err, isMatch) => {
      if (err) { return done(err); }
      if (isMatch) {
        return done(null, user);
      }
      return done(null, false, { msg: 'Invalid email or password.' });
    });
  });
}));

/**
 * Sign in with GitHub.
 */
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_ID,
  clientSecret: process.env.GITHUB_SECRET,
  callbackURL: `${process.env.BASE_URL}/auth/github/callback`,
  passReqToCallback: true,
  scope: ['user:email']
}, (req, accessToken, refreshToken, profile, done) => {
  if (req.user) {
    User.findOne({ github: profile.id }, (err, existingUser) => {
      if (existingUser) {
        req.flash('errors', { msg: 'There is already a GitHub account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
        done(err);
      } else {
        User.findById(req.user.id, (err, user) => {
          if (err) { return done(err); }
          user.github = profile.id;
          user.tokens.push({ kind: 'github', accessToken });
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.picture = user.profile.picture || profile._json.avatar_url;
          user.profile.location = user.profile.location || profile._json.location;
          user.profile.website = user.profile.website || profile._json.blog;
          user.save((err) => {
            req.flash('info', { msg: 'GitHub account has been linked.' });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({ github: profile.id }, (err, existingUser) => {
      if (err) { return done(err); }
      if (existingUser) {
        return done(null, existingUser);
      }
      User.findOne({ email: profile._json.email }, (err, existingEmailUser) => {
        if (err) { return done(err); }
        if (existingEmailUser) {
          req.flash('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with GitHub manually from Account Settings.' });
          done(err);
        } else {
          const user = new User();
          user.email = _.get(_.orderBy(profile.emails, ['primary', 'verified'], ['desc', 'desc']), [0, 'value'], null);
          user.github = profile.id;
          user.tokens.push({ kind: 'github', accessToken });
          user.profile.name = profile.displayName;
          user.profile.picture = profile._json.avatar_url;
          user.profile.location = profile._json.location;
          user.profile.website = profile._json.blog;
          user.save((err) => {
            done(err, user);
          });
        }
      });
    });
  }
}));


/**
 * Sign in with Spotify.
 */
if(process.env.SPOTIFY_ID){
  
   passport.use('spotify', new OAuth2Strategy({
    authorizationURL: 'https://accounts.spotify.com/authorize',
    tokenURL: 'https://accounts.spotify.com/api/token',
    clientID: process.env.SPOTIFY_ID,
    clientSecret: process.env.SPOTIFY_SECRET,
    callbackURL: `${process.env.BASE_URL}/auth/spotify/callback`,
    scope: ['user-read-private', 'user-read-email'],
    
    refreshToken: `https://accounts.spotify.com/api/token`,
    passReqToCallback: true
  },
  (req, accessToken, refreshToken, profile, done) => {
     
     console.log('Find user', accessToken, profile);
    User.findById(req.user._id, (err, user) => {
      if (err) { return done(err); }
      
      const existingTokens = user.tokens.filter(t => t.kind !== 'spotify')
      user.tokens = [...existingTokens, { kind: 'spotify', accessToken, refreshToken }];
      
      user.save((err) => {
        done(err, user);
      });
    });
  }));
  /*
  passport.use('spotify', new OAuth2Strategy({
    authorizationURL: 'https://accounts.spotify.com/authorize',
    tokenURL: 'https://accounts.spotify.com/api/token',
    clientID: process.env.SPOTIFY_ID,
    clientSecret: process.env.SPOTIFY_SECRET,
    callbackURL: `${process.env.BASE_URL}/auth/spotify/callback`,
    scope: ['user-read-private', 'user-read-email'],
    
    refreshToken: `https://accounts.spotify.com/api/token`,
    passReqToCallback: true
  },
  (req, accessToken, refreshToken, profile, done) => {
    
    console.log('Find user', accessToken, profile);
    
    User.findById(req.user._id, (err, user) => {
      if (err) { return done(err); }
      
      const existingTokens = user.tokens.filter(t => t.kind !== 'spotify')
      user.tokens = [...existingTokens, { kind: 'spotify', accessToken, refreshToken }];
      
      console.log('Saving user', user);
      
      user.save((err) => {
        done(err, user);
      });
    });
  }));
 passport.use(new OAuth2Strategy({
    clientID: process.env.SPOTIFY_ID,
    clientSecret: process.env.SPOTIFY_SECRET,
    callbackURL: `${process.env.BASE_URL}/auth/spotify/callback`,
    passReqToCallback: true,
    scope: ['user-read-private', 'user-read-email']
  }, (req, accessToken, refreshToken, profile, done) => {
    if (req.user) {
      console.log('spotify', 'find', req.user, profile);
      User.findOne({ spotify: profile.id }, (err, existingUser) => {
        if (existingUser) {
          req.flash('errors', { msg: 'There is already a Spotify account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
          done(err);
        } else {
          User.findById(req.user.id, (err, user) => {
            if (err) { return done(err); }
            user.spotify = profile.id;
            user.tokens.push({ kind: 'spotify', accessToken });
            user.profile.name = user.profile.name || profile.displayName;
            user.profile.picture = user.profile.picture || profile._json.avatar_url;
            user.profile.location = user.profile.location || profile._json.location;
            user.profile.website = user.profile.website || profile._json.blog;
            user.save((err) => {
              req.flash('info', { msg: 'Spotify account has been linked.' });
              done(err, user);
            });
          });
        }
      });
    } else {
      User.findOne({ spotify: profile.id }, (err, existingUser) => {
        if (err) { return done(err); }
        if (existingUser) {
          return done(null, existingUser);
        }
        User.findOne({ email: profile._json.email }, (err, existingEmailUser) => {
          if (err) { return done(err); }
          if (existingEmailUser) {
            req.flash('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with Spotify manually from Account Settings.' });
            done(err);
          } else {
            const user = new User();
            user.email = _.get(_.orderBy(profile.emails, ['primary', 'verified'], ['desc', 'desc']), [0, 'value'], null);
            user.spotify = profile.id;
            user.tokens.push({ kind: 'spotify', accessToken });
            user.profile.name = profile.displayName;
            user.profile.picture = profile._json.avatar_url;
            user.profile.location = profile._json.location;
            user.profile.website = profile._json.blog;
            user.save((err) => {
              done(err, user);
            });
          }
        });
      });
    }
  }));
  */
}


/**
 * Authorization Required middleware.
 */
const isAuthenticated = (req, res, next) => {
  const provider = req.path.split('/')[2];
  if(!req.user){
    return next();
  }
  const token = req.user.tokens.find(token => token.kind === provider);
  if (token) {
    // Is there an access token expiration and access token expired?
    // Yes: Is there a refresh token?
    //     Yes: Does it have expiration and if so is it expired?
    //       Yes, Quickbooks - We got nothing, redirect to res.redirect(`/auth/${provider}`);
    //       No, Quickbooks and Google- refresh token and save, and then go to next();
    //    No:  Treat it like we got nothing, redirect to res.redirect(`/auth/${provider}`);
    // No: we are good, go to next():
    if (token.accessTokenExpires && moment(token.accessTokenExpires).isBefore(moment().subtract(1, 'minutes'))) {
      if (token.refreshToken) {
        if (token.refreshTokenExpires && moment(token.refreshTokenExpires).isBefore(moment().subtract(1, 'minutes'))) {
          res.redirect(`/auth/${provider}`);
        } else {
          refresh.requestNewAccessToken(`${provider}`, token.refreshToken, (err, accessToken, refreshToken, params) => {
            User.findById(req.user.id, (err, user) => {
              user.tokens.some((tokenObject) => {
                if (tokenObject.kind === provider) {
                  tokenObject.accessToken = accessToken;
                  if (params.expires_in) tokenObject.accessTokenExpires = moment().add(params.expires_in, 'seconds').format();
                  return true;
                }
                return false;
              });
              req.user = user;
              user.markModified('tokens');
              user.save((err) => {
                if (err) console.log(err);
                next();
              });
            });
          });
        }
      } else {
        res.redirect(`/auth/${provider}`);
      }
    } else {
      next();
    }
  } else {
    res.redirect(`/auth/${provider}`);
  }
};

module.exports = {isAuthenticated};