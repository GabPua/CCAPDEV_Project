const mongoose = require('mongoose');

let commentSchema = new mongoose.Schema({
    user: {type: String, require: true, ref: 'User'},
    recipe: {type: mongoose.ObjectId, require: true, ref: 'Recipe'},
    reply_to: {type: mongoose.ObjectId, require: false, ref: 'Comment'},
    body: {type: String, require: true},
});

module.exports = mongoose.model('Comment', commentSchema, 'comment');