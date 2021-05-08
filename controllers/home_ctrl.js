const page_title = 'ShefHub | Free Recipes & More';
const Post = require('../models/recipe');
const post_ctrl = require('./post_ctrl');

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

    getFeatured: async (req, res) => {
        await Post.countDocuments(async (err, count) => {
            req.body.skip = Math.floor(Math.random() * count);
            await post_ctrl.loadRecipe(req, res);
        }).lean().exec();
    }
}

module.exports = home_controller;
