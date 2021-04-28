const User = require('../models/user');
const Follow = require('../models/follow');
const Posts = require('../models/recipe');

// checks if the credentials inside the cookie are valid
function redirect (req, res, toRun) {
    if (req.session._id && req.cookies.user_sid) {
        toRun();
    } else {
        res.redirect('/');
    }
}

const user_controller = {
    getCreate: (req, res) => {
        redirect(req, res, () => {
            res.render('create', {
                title: 'Create a new recipe'
            });
        });
    },

    postCreate: (req, res) => {
      redirect(req, res, async () => {
          // TODO: Insert doc to recipe
      });
    },

    getProfile: (req, res) => {
        redirect(req, res, async () => {
            let user, followers, following, posts;

            // get user details using id stored in session
            await User.findById( req.session._id, null, null, (err, result) => {
                user = result;
            }).lean().exec();

            // get number of followers
            await Follow.find({ following: req.session._id }, null, (err, result) => {
                followers = result.length;
            }).lean().exec();

            // get number of following
            await Follow.find({ follower: req.session._id }, null, (err, result) => {
                following = result.length;
            }).lean().exec();

            // get number of posts
            await Posts.find( { user_id: req.session._id }, null, null, (err, result) => {
                posts = result.length;
            }).lean().exec();

            res.render('profile', {
                    title: "ShefHub | " + user._id,
                    user: user,
                    followers: followers,
                    following: following,
                    post: posts,
                    template: 'profile'
                }
            );
        });
    },

    postProfile: (req, res) => {
        redirect(req, res, async () => {

            // TODO: verify info and update profile in db

            res.redirect('/profile');
        });
    },

    getPosts: (req, res) => {
        redirect(req, res, async () => {
            let posts;
            await Posts.find( { user_id: req.session._id }, null, null, (err, result) => {
               posts = result;
            }).lean().exec();


        });
    },

    getLikes: (req, res) => {
        redirect(req, res, async () => {

        });
    },

    getFollowing: (req, res) => {
        redirect(req, res, async () => {

        })
    },

    getFollowers: (req, res) => {
        redirect(req, res, async () => {
            let followers;
            await Follow.find({ following: req.session._id }, 'follower', (err, result) => {
                followers = result;
            }).lean().exec();

            res.render('profile', {
                title: "ShefHub | " + req.session._id,
                followers: followers,
                template: 'followers'
            });
        });
    },

    getSearch: (req, res) => {
        redirect(req, res, () => {
            const { keyword } = req.query

            if (keyword) {
                res.render('query', {
                    title: 'Search | ' + keyword,
                    query: keyword
                });
            } else {
                res.render('search', {
                    title: 'ShefHub | Search Recipes'
                });
            }
        });
    },

    getLogout: (req, res) => {
        redirect(req, res, () => {
            req.session.destroy();
            res.clearCookie('user_sid');
            res.redirect('/');
        });
    }
}

module.exports = user_controller;
