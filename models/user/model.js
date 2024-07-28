const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    image: String,
    password: String,
    googleId: String,
    facebookId: String,
    githubId: String,
}, {
    timestamps: true,
    collection: 'users',
})

const userModel = mongoose.model("User", userSchema)
module.exports = userModel