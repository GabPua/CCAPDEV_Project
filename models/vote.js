const mongoose = require('mongoose');

let voteSchema = new mongoose.Schema({
    recipe_id: {type: Number, require: true},
    user_id: {type: String, require: true},
    value: {type: Number, require: true}
});

module.exports = mongoose.model('Vote', voteSchema, 'vote');