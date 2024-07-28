const passport = require('passport');

const authCheck = passport.authenticate('jwt', { session: false });

module.exports = authCheck;