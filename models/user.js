const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    password: {type: String, require: true},
    profession: {type: String, require: false},
    email: {type: String, require: true},
    workplace: {type: String, require: false},
    desc: {type: String, require: false},
    // TODO: profile picture
    followers: {type: Array, require:true},
    following: {type: Array, require: true}
});

module.exports = mongoose.model('User', userSchema);