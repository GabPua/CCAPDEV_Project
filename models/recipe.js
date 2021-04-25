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
    ingredients: {type: String, require: true},
    like: {type: Array, require: true},
    dislikes: {type: Array, require: true}
});

module.exports = mongoose.model('Recipe', recipeSchema, 'recipe');