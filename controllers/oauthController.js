const passport = require('passport'),
  jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET

const handleSocialAuth = (provider) => {
  return [
    passport.authenticate(provider, {
      session: false,
      failureRedirect: `${process.env.CLIENT_ORIGIN}/login`,
    }),
    (req, res) => {
        const payload = { id: req.user._id, name: req.user.name, email: req.user.email};
        const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
        res.redirect(`${process.env.CLIENT_ORIGIN}/auth-handler?token=${token}`);
    },
  ];
};

const oauthController = {
    googleAuth: passport.authenticate('google', {
        scope: ['profile', 'email']
    }),
    githubAuth: passport.authenticate('github', {
        scope: ['user:email']
    }),
    facebookAuth: passport.authenticate('facebook', {
        scope: ['email', 'public_profile']
    }),

    googleAuthRedirect: handleSocialAuth('google'),
    githubAuthRedirect: handleSocialAuth('github'),
    facebookAuthRedirect: handleSocialAuth('facebook'),
};

module.exports = oauthController;