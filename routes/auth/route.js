const authCheck = require('../../middlewares/AuthCheck'),
    authController = require('../../controllers/authController'),
    oauthController = require('../../controllers/oauthController'),
    authRoute = require('express').Router();

authRoute.post('/signup', authController.signup);
authRoute.post('/login', authController.login);
authRoute.get('/profile', authCheck, authController.profile);

// OAuth routes handled by oauthController
authRoute.get('/google', oauthController.googleAuth);
authRoute.get('/github', oauthController.githubAuth);
authRoute.get('/facebook', oauthController.facebookAuth);

authRoute.get('/google/redirect', oauthController.googleAuthRedirect);
authRoute.get('/github/redirect', oauthController.githubAuthRedirect);
authRoute.get('/facebook/redirect', oauthController.facebookAuthRedirect);

module.exports = authRoute;