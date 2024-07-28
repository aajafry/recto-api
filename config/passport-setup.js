const passport = require('passport'),
    bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt,
    GoogleStrategy = require('passport-google-oauth20').Strategy,
    GithubStrategy = require('passport-github2').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    LocalStrategy = require('passport-local').Strategy,
    userModel = require('../models/user/model');

const jwtSecret = process.env.JWT_SECRET

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await userModel.findOne({ email: email });

        if (!user) {
            return done(null, false, {
                message: 'user not found' 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return done(null, false, {
                message: 'incorrect password' 
            });
        }

        return done(null, user);
    } catch (error) {
        return done(error)
    }
}))


const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret,
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        const user = await userModel.findById(jwt_payload.id);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error, false);
    }
}));


const handleUser = async (profile, done, provider) => {
    try {
        let user = await userModel.findOne({[`${provider}Id`]: profile.id})
        
        if (user) {
            return done(null, user)
        }else{
            user = await userModel.findOne({email: profile.emails[0].value})
            if(user){
                user[`${provider}Id`] = profile.id
                user.image = profile.photos[0].value
                await user.save()
                return done(null, user)
            }else{
                user = new userModel({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    image: profile.photos[0].value,
                    [`${provider}Id`]: profile.id
                })
                await user.save()
                return done(null, user)
            }
        }
    } catch (error) {
        return done(error)
    }
}


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_ORIGIN}/api/auth/google/redirect`
},(accessToken, refreshToken, profile, done) => 
    handleUser(profile, done, "google")
))


passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_ORIGIN}/api/auth/github/redirect`
},(accessToken, refreshToken, profile, done) => 
    handleUser(profile, done, "github")
))


passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${process.env.SERVER_ORIGIN}/api/auth/facebook/redirect`,
    profileFields: ['id', 'emails', 'name', 'displayName']
}, (accessToken, refreshToken, profile, done) => 
    handleUser(profile, done, 'facebook')
))


passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    userModel.findById(id)
        .then((user) => {
            if (!user) {
                return done(null, false);
            }
            done(null, user);
        })
        .catch((err) => {
            done(err, null);
        });
});