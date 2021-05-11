const Vote = require('../models/vote');

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

    addVote: async (req, res) => {
        const recipe = req.body.recipe_id;
        const user = req.session._id;
        const value = req.body.vote_value;

        await Vote.create({recipe: recipe, user: user, value: value}, (err) => {
            res.send(err === null);
        });
    }
}

module.exports = vote_controller;
