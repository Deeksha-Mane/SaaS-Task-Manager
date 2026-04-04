import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
            // User exists, return user
            return done(null, user);
        }

        // Create new user
        user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: Math.random().toString(36).slice(-8), // Random password (won't be used)
            googleId: profile.id
        });

        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/api/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // GitHub might not provide email, use profile email or generate one
        const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            return done(null, user);
        }

        // Create new user
        user = await User.create({
            name: profile.displayName || profile.username,
            email,
            password: Math.random().toString(36).slice(-8),
            githubId: profile.id
        });

        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));

export default passport;
