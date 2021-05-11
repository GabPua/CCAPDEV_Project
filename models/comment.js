const mongoose = require('mongoose');

let commentSchema = new mongoose.Schema({
    user: {type: String, require: true, ref: 'User'},
    recipe: {type: mongoose.ObjectId, require: true, ref: 'Recipe'},
    reply_to: {type: mongoose.ObjectId, require: true, ref: 'Comment', default: null},
    body: {type: String, require: true},
    date: {type: Date, require: true}
});

async function clearReplies(id) {
    await mongoose.model('Comment').deleteMany({reply_to : id}).exec()
}

commentSchema.post('findOneAndDelete', (comment) => {
    // is not a reply
    if (!comment.reply_to) {
        clearReplies(comment._id).then(() => {
            console.log("Cleared replies");
        });
    }
});

module.exports = mongoose.model('Comment', commentSchema, 'comment');
