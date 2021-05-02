const page_title = 'ShefHub | Free Recipes & More';
const User = require('../models/user');
const Post = require('../models/recipe');

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
        let path = null;

        if (req.session._id && req.cookies.user_sid) {
            // get user picture
            await User.findById(req.session._id ,(err, result) => {
                path = result.picture_path;
            }).lean().exec();
        }

        res.render('about', {
            title: page_title,
            path: path
        });
    },

    getFeatured: async (req, res) => {
        let path = null;

        if (req.session._id && req.cookies.user_sid) {
            // get user picture
            await User.findById(req.session._id ,(err, result) => {
                path = result.picture_path;
            }).lean().exec();
        }

        let post;
        Post.count().exec((err, count) => {
            const random = Math.floor(Math.random() * count);

            Post.findOne().skip(random).lean().exec((err, result) => {
                post = result;
                console.log(post);
                res.render('post', {
                    title: 'ShefHub | ' + post.title,
                    post: post,
                    path: path
                });
            });
        });
    }
}

module.exports = home_controller;
