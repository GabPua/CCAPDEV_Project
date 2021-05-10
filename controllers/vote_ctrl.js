const User = require('../models/user');
const Post = require('../models/recipe');
const Comment = require('../models/comment');
const Vote = require('../models/vote');
const async = require('async');

const vote_controller = {
    deleteVote: (req, res) => {
        const recipe = req.body.recipe_id;
        const user = req.session._id;

        Vote.deleteOne({recipe: recipe, user: user}, (err) => {
            res.send(err === null);
        });
    },

    updateVote: (req, res) => {
        const recipe = req.body.recipe_id;
        const user = req.session._id;
        const value = req.body.vote_value;

        Vote.updateOne({recipe: recipe, user: user}, {value: value}, (err) => {
            res.send(err === null);
        });
    },

    addVote: (req, res) => {
        const recipe = req.body.recipe_id;
        const user = req.session._id;
        const value = req.body.vote_value;

        Vote.create({recipe: recipe, user: user, value: value}, (err) => {
            res.send(err === null);
        });
    }
}

module.exports = vote_controller;