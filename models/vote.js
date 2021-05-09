const mongoose = require('mongoose');

let voteSchema = new mongoose.Schema({
    recipe: {type: mongoose.ObjectId, require: true, ref: 'Recipe'},
    user: {type: String, require: true, ref: 'User'},
    value: {type: Number, require: true}
});

module.exports = mongoose.model('Vote', voteSchema, 'vote');
