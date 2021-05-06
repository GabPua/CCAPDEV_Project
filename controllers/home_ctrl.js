const page_title = 'ShefHub | Free Recipes & More';
const User = require('../models/user');
const Post = require('../models/recipe');
const Comment = require('../models/comment');

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
        let user = null, path = null;

        if (req.session._id && req.cookies.user_sid) {
            // get user
            await User.findById(req.session._id, (err, result) => {
                user = result;
                path = result.picture_path;
            }).lean().exec();
        }

        let post, comments;
        await Post.countDocuments().exec(async (err, count) => {
            let random = Math.floor(Math.random() * count), id = {};

            if (req.body.recipe_id) {
                id = { _id: req.body.recipe_id };
                random = 0;
            }

            // find a post
            Post.findOne(id).skip(random).lean().exec( (err, result) => {
                post = result;

                // get comments in post
                Comment.find({recipe: post._id, reply_to: null}).sort({date: 1}).populate('user').lean().exec( (err, results) => {
                    let ctr = 0;
                    comments = results;

                    // get replies for each comment and append the array to the comment object
                    comments.forEach(async e => {
                        await Comment.find({reply_to: e._id}, (err, replies) => {
                            e.replies = replies;
                        }).sort({date: 1}).populate('user').lean().exec();
                        ctr++;

                        // load page when all replies have been found
                        if (ctr === results.length) {
                            res.render('post', {
                                title: 'ShefHub | ' + post.title,
                                post: post,
                                path: path,
                                user: user,
                                comments: comments
                            });
                        }
                    });

                    // no comments were found
                    if (comments.length === 0) {
                        res.render('post', {
                            title: 'ShefHub | ' + post.title,
                            post: post,
                            path: path,
                            user: user
                        });
                    }
                });
            });
        });
    }
}

module.exports = home_controller;
