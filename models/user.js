const mongoose = require('mongoose');
const Follow = require('./follow');
const Vote = require('./vote');
const Post = require('./recipe');
const async = require('async')

let userSchema = new mongoose.Schema({
    _id: {type: String, lowercase: true, require: true},
    password: {type: String, require: true},
    profession: {type: String, require: false},
    email: {type: String, require: true},
    workplace: {type: String, require: false},
    desc: {type: String, require: false},
    picture_path: {type: String, require: false}
});

userSchema.post(['deleteOne', 'findOneAndDelete'], (user) => {

    async.series([
        function deleteFollowing(callback) {
            Follow.deleteMany({follower: user._id}, (err, result) => {
                callback(err, result);
            });
        },

        function deleteFollowers(callback) {
            Follow.deleteMany({following: user._id}, (err, result) => {
                callback(err, result);
            });
        },

        function deleteVotes(callback) {
            Vote.deleteMany({user: user._id}, (err, result) => {
                callback(err, result);
            });
        },

        function deletePosts(callback) {
        // TODO: delete likes and comments related to posts
            Post.deleteMany({user: user._id}, (err, result) => {
                callback(err, result);
            });
        },

        // TODO: Delete user's comments and comments of others on user's posts

    ], );
});

module.exports = mongoose.model('User', userSchema, 'user');
