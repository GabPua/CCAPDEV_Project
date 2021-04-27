const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    _id: {type: String, require: true},
    password: {type: String, require: true},
    profession: {type: String, require: false},
    email: {type: String, require: true},
    workplace: {type: String, require: false},
    desc: {type: String, require: false},
    picture_path: {type: String, require: false}
});

module.exports = mongoose.model('User', userSchema, 'user');