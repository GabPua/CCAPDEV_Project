const page_title = 'ShefHub | Free Recipes & More';
const Post = require('../models/recipe');
const post_ctrl = require('./post_ctrl');
const async = require('async');

const home_controller = {
    getIndex: (req, res) => {
        if (req.session._id && req.cookies.user_sid) {
            require('./user_ctrl').getNewsfeed(req, res);
        } else {
            res.render('home', {
                title: page_title
            });
        }
    },

    getAbout: async (req, res) => {
        res.render('about', {
            title: page_title
        });
    },

    getFeatured: (req, res) => {
        async.waterfall([
            function countPosts(callback) {
                Post.countDocuments((err, count) => {
                    callback(err, count);
                }).lean();
            },
        ], (err, count) => {
            req.body.skip = Math.floor(Math.random() * count);
            post_ctrl.loadRecipe(req, res);
        });
    }
}

module.exports = home_controller;
