const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await User.findById(payload.id);
      
      if (user) {
        return done(null, user);
      }
      
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Local Strategy for login
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        // Find user by email
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        
        // Check password
        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        
        // Update last login
        user.lastLoginAt = new Date();
        await user.save();
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
          // User exists, update last login
          user.lastLoginAt = new Date();
          await user.save();
          return done(null, user);
        }
        
        // Check if email already exists with local auth
        user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.authProvider = 'google';
          user.avatar = user.avatar || profile.photos[0]?.value;
          user.lastLoginAt = new Date();
          await user.save();
          return done(null, user);
        }
        
        // Create new user
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          avatar: profile.photos[0]?.value,
          authProvider: 'google',
          lastLoginAt: new Date()
        });
        
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

module.exports = passport;