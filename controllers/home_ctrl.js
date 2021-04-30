const page_title = 'ShefHub | Free Recipes & More';
const User = require('../models/user');

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
        let user = null;

        if (req.session._id && req.cookies.user_sid) {
            // get user
            await User.findById(req.session._id ,(err, result) => {
                user = result;
            }).lean().exec();
        }

        res.render('about', {
            title: page_title,
            user: user
        });
    },

    getFeatured: async (req, res) => {
        let user = null;

        if (req.session._id && req.cookies.user_sid) {
            // get user
            await User.findById(req.session._id ,(err, result) => {
                user = result;
            }).lean().exec();
        }

        res.render('featured', {
            title: page_title,
            user: user
        });
    }
}

module.exports = home_controller;
