const mongoose = require('mongoose');
const leanVirtual = require('mongoose-lean-virtuals');
const Comment = require('./comment');

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

async function clearComments(id) {
    await Comment.deleteMany({ recipe : id }).lean().exec();
}

recipeSchema.post('findOneAndDelete', (recipe) => {
    clearComments(recipe._id).then(() => console.log('Deleted comments for post'));
});

module.exports = mongoose.model('Recipe', recipeSchema, 'recipe');
