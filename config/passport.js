// /config/passport.js

import dotenv from 'dotenv';
dotenv.config();
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import {Strategy as GoogleStrategy} from 'passport-google-oauth20';
import User from '../models/User.js'; 

// 로그인 전략 설정
passport.use(new LocalStrategy({
  usernameField:'email',
  passwordField:'password'
  },
  async (username, password, done) => {
    console.log("Attempting login for email:", username);
    console.log("Received password:", password);
    try{
      
      const user = await User.findOne({email:username});
      // console.log("Found user:", user);
      if(!user){
        console.log("!user");
        return done(null,false,{message: "invalid username"});
      }
      const isMatch = await user.comparePassword(password);
      console.log("isMatch="+isMatch);
      if(!isMatch){
        console.log("!isMatch");
        return done(null,false,{message:"invalid pwd"});
      }
      return done(null,user)
    } catch (err){
      console.log("catch ERR");
      console.log(err);
      return done(err);
    }
  }
));


// 구글

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
},
async function(accessToken, refreshToken, profile, done) {
  console.log("Google Strategy Callback");
  console.log("Access Token:", accessToken);
  console.log("Refresh Token:", refreshToken);
  
  const authInfo = { accessToken, refreshToken };
  
  try {
    let user = await User.findOne({ googleId: profile.id });
    
    if (!user) {
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value
      });
      await user.save();
    }
    
    return done(null, user, authInfo);
  } catch (err) {
    return done(err);
  }
}
));



passport.serializeUser(async (user, done) => {
  console.log('serial request');
  await done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  console.log("desirealize request");
  console.log(id);
  try{
    const user = await User.findById(id);
    done(null,user);
  } catch(err) {
    console.error('Error in deserializeUser:', err);
    done(err);
  };
});

export default passport;