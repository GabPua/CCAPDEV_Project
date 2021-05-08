const page_title = 'ShefHub | Free Recipes & More';
const User = require('../models/user');
const Post = require('../models/recipe');
const Comment = require('../models/comment');
const Vote = require('../models/vote');

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
        let user = null;

        if (req.session._id && req.cookies.user_sid) {
            // get user
            await User.findById(req.session._id, (err, result) => {
                user = result;
            }).lean().exec();
        }

        let id, random, post, comments;

        // get post to render. If no specific recipe given (featured), get a random one.
        if (req.body.recipe_id) {
            id = {_id: req.body.recipe_id};
            random = 0;
        } else {
            await Post.countDocuments(async (err, count) => {
                id = {};
                random = Math.floor(Math.random() * count);
            }).lean().exec();
        }

        // find the desired post
        await Post.findOne(id, async (err, result) => {
            post = result;
        }).skip(random).lean().exec();

        // get top level comments only
        await Comment.find({recipe: post._id, reply_to: null}, (err, result) => {
            comments = result;
        }).sort({date: 1}).populate('user').lean().exec();

        // get replies for each comment and append the array to the comment object
        for (const comment of comments) {
            await Comment.find({reply_to: comment._id}, (err, replies) => {
                console.log('LOOKING FOR REPLIES');
                comment.replies = replies;
            }).sort({date: 1}).populate('user').lean().exec();
        }

        res.render('post', {
            title: 'ShefHub | ' + post.title,
            post: post,
            user: user,
            comments: comments
        });
    }
}

module.exports = home_controller;
