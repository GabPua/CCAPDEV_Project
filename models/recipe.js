const mongoose = require('mongoose');

let recipeSchema = new mongoose.Schema({
    user_id: {type: String, require: true},
    title: {type: String, require: true},
    desc: {type: String, require: false},
    serving: {type: Number, require: true},
    picture: {type: Array, require: true},
    prep_time: {type: Number, require: true},
    cook_time: {type: Number, require: true},
    direction: {type: String, require: true},
    ingredient: {type: String, require: true},
    date: {type: Date, require: true}
});

module.exports = mongoose.model('Recipe', recipeSchema, 'recipe');