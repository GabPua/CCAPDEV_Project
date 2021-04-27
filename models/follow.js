const mongoose = require('mongoose');

let followSchema = new mongoose.Schema({
    follower: {type: String, require: true},
    following: {type: String, require: false}
});

module.exports = mongoose.model('Follow', followSchema, 'follow');