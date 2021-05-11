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

        // verify
        Comment.findOneAndDelete({_id: id, recipe: recipe_id, user: req.session._id},(err, result) => {
            res.send(result != null);
        });
    },

    editComment: (req, res) => {
        const { id, body } = req.body;

        if (body) {
            Comment.updateOne({_id: id, user: req.session._id}, {body: body.replace('<br>', '\n')}, (err) => {
                res.send(err != null);
            });
        } else {
            res.send(false);
        }
    },

    getComment: (req, res) => {
        const { id } = req.body;

        Comment.findById(id, (err, result) => {
            res.send(result? result.body : false);
        });
    }
}

module.exports = comment_controller;
