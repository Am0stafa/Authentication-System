const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
require('dotenv').config()

const GOOGLE_CLIENT_ID =process.env.CLINT
const GOOGLE_CLIENT_SECRET = process.env.SECRET


passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",//! server url
      },
      function (accessToken, refreshToken, profile, done) {
        //! after authentication it is going to give accessToken, refresh, Token, Profile and a callBack function so we after login process we can use any db and find or create a new user
      
        //! if every thing is done we return no error and profile which is the user id, user name , profile picture ...etc 
        
        done(null, profile);
      }
    )
);


//! since we are using sessions we should serialize and deserialize our user
//^ we use that to pass our session
passport.serializeUser((user, done) => {

    done(null, user);
});
  
passport.deserializeUser((user, done) => {

    done(null, user);
});