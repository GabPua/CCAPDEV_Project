const mongoose = require('mongoose');
const async = require('async');
const leanVirtual = require('mongoose-lean-virtuals');
const Comment = require('./comment');
const Vote = require('./vote');

let recipeSchema = new mongoose.Schema({
    user: {type: String, require: true, ref: 'User'},
    title: {type: String, require: true},
    desc: {type: String, require: false},
    serving: {type: Number, require: true},
    n_pictures: {type: Number, require: true},
    prep_time: {type: Number, require: true},
    cook_time: {type: Number, require: true},
    direction: {type: Array, require: true},
    ingredient: {type: Array, require: true},
    date: {type: Date, require: true}
});

recipeSchema.virtual('likes', {
    ref: 'Vote',
    localField: '_id',
    foreignField: 'recipe'
});

recipeSchema.plugin(leanVirtual);

recipeSchema.post('findOneAndDelete', (recipe) => {
    async.series([
        function deleteComments (callback) {
            Comment.deleteMany({ recipe : recipe._id }, (err) => {
                callback(err);
            }).lean();
        },

        function deleteVotes (callback) {
            Vote.deleteMany({recipe: recipe._id}, (err) => {
                callback(err);
            }).lean();
        }
    ], (err) => {
        console.log('DELETING A POST... ERROR ENCOUNTERED:', err);
    });
});

module.exports = mongoose.model('Recipe', recipeSchema, 'recipe');
