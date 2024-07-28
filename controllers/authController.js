const passport = require('passport'),
    bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken'),
    userModel = require('../models/user/model');

const jwtSecret = process.env.JWT_SECRET

const getUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    image: user.image,
    googleId: user.googleId, 
    facebookId: user.facebookId, 
    githubId: user.githubId 
})

const authController = {
    signup: async (req, res) => {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);

            const user = new userModel({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword
            });

            await user.save();
            res.status(200).json({
                message: 'user registered successfully'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: 'an error occurred during signup'
            });
        }
    },

    login: (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(401).json({
                    message: 'login failed. invalid credentials.' 
                });
            }

            const payload = { id: user._id, name: user.name, email: user.email };
            const token = jwt.sign(payload, jwtSecret, 
                { expiresIn: '1h' }
            );

            return res.status(200).json({ 
                message: 'Login successful', 
                token: token,
            });
        })(req, res, next);
    },

    profile: (req, res) => {
        res.json({ 
            user: getUser(req.user)
        });
    }
};

module.exports = authController;