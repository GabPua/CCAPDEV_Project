const async = require('async');
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

        await Comment.create(comment, (err, result) => {
            res.send({
                comment_id: err? null : result._id,
                user_id: req.session._id,
                picture_path: req.session.picture_path
            });
        });
    },

    deleteComment: async (req, res) => {
        const { id, recipe_id } = req.body;

        Comment.findOneAndDelete({_id: id, recipe: recipe_id, user: req.session._id},(err, result) => {
            res.send(result != null);
        });
    },

    // editComment: async (req, res) => {
    //
    // }
}

module.exports = comment_controller;
