const mongoose = require('mongoose');

let followSchema = new mongoose.Schema({
    follower: {type: String, require: true, ref: 'User'},
    following: {type: String, require: true, ref: 'User'}
});

module.exports = mongoose.model('Follow', followSchema, 'follow');