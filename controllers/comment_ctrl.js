const Comment = require('../models/comment');

const comment_controller = {
    addComment: async (req, res) => {
        const { text, recipe_id } = req.body;

        let comment = {
            user: req.session._id,
            recipe: recipe_id,
            reply_to: null,
            body: text,
            date: new Date()
        }

        await Comment.create(comment, (err) => {
            if (err) {
                res.send({user_id: null, picture_path: null});
            } else {
                res.send({user_id: req.session._id, picture_path: req.session.picture_path});
            }
        });
    }
}

module.exports = comment_controller;
