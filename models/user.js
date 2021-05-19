const mongoose = require('mongoose');
const Follow = require('./follow');
const Vote = require('./vote');
const Post = require('./recipe');
const Comment = require('./comment');
const async = require('async')
const dotenv = require('dotenv')
const crypto = require('crypto-js');

dotenv.config();
const key = process.env.SECRET;

let userSchema = new mongoose.Schema({
    _id: {type: String, trim: true, lowercase: true, require: true},
    password: {type: String, require: true},
    profession: {type: String, trim: true, require: false},
    email: {type: String, trim: true, require: true},
    workplace: {type: String, trim: true, require: false},
    desc: {type: String, trim: true, require: false},
    picture_path: {type: String, require: false}
});

userSchema.pre('save', function encryptPassword(next) {
    if (this.isModified('password')) {
        this.password = crypto.AES.encrypt(this.password, key).toString();
    }
    next();
});

userSchema.post(['deleteOne', 'findOneAndDelete'], function deleteRelatedRecords(user) {

    async.series([
        function deleteFollows(callback) {
            Follow.deleteMany({ $or: [{follower: user._id}, {following: user._id}] }, (err, result) => {
                callback(err, result);
            });
        },

        function deleteVotes(callback) {
            Vote.deleteMany({user: user._id}, (err, result) => {
                callback(err, result);
            });
        },

        function deletePosts(callback) {
            async.waterfall([
                function findPosts(callback) {
                    Post.find({user: user._id}, '_id', (err, result) => {
                        callback(err, result)
                    }).lean();
                },

                function deletePosts(posts, callback) {
                    console.log(posts);
                    async.each(posts, function deleteEachPosts (post, callback) {
                        // this also delete likes and comments related to the post, defined in recipe model
                        Post.findOneAndDelete({_id: post._id}, (err) => {
                            callback(err);
                        }).lean();
                    }, (err) => {
                        callback(err, 'SUCCESS');
                    });
                },
            ], (err, result) => {
                callback(err, result);
            });
        },

        function deleteComments(callback) {
            async.waterfall([
                function findComments(callback) {
                    Comment.find({user: user._id}, '_id', (err, result) => {
                        callback(err,result);
                    }).lean();
                },

                function deleteComments(comments, callback) {
                    console.log(comments);

                    async.each(comments, function deleteEachComment (comment, callback)  {
                        // this also deletes replies to the comment, defined in comment model
                            Comment.findOneAndDelete({_id: comment._id}, (err) => {
                               callback(err);
                            }).lean();
                        },
                        (err) => {
                            callback(err, 'SUCCESS');
                        }
                    );
                }
            ], (err, result) => {
                callback(err, result);
            });
        }

    ], (err, result) => {
        console.log('DELETE USER... ERROR ENCOUNTERED:', err);
        console.log('DELETE FOLLOWS...', result[0]);
        console.log('DELETE VOTES...', result[1]);
        console.log('DElETE POSTS...', result[2]);
        console.log('DELETE COMMENTS...', result[3]);
    });
});

module.exports = mongoose.model('User', userSchema, 'user');
