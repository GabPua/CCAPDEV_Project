const User = require('../models/user');
const Follow = require('../models/follow');

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

    getLogout: (req, res) => {
        redirect(req, res, () => {
            req.session.destroy();
            res.clearCookie('user_sid');
            res.redirect('/');
        });
    },

    getProfileView: (req, res) => {
        redirect(req, res, async () => {
            let user, followers, following;
            await User.findById( req.session._id, null, null, (err, result) => {
                user = result;
            }).lean().exec();

            await Follow.find({ following: req.session._id }, null, (err, result) => {
                followers = result.length;
            }).lean().exec();

            await Follow.find({ follower: req.session._id }, null, (err, result) => {
                following = result.length;
            }).lean().exec();

            console.log(user);
            console.log(followers);
            console.log(following);

            res.render('profile', {
                    title: "YOUR PROFILE", // TODO: name?
                    user: user,
                    followers: followers,
                    following: following,
                    template: req.path.replace('/', ''),
                    helpers: {
                        ifEquals: (arg1, arg2, options) => {
                            return arg1 === arg2 ? options.fn(this) : options.inverse(this);
                        }
                    }
                }
            );
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
    }
}

module.exports = user_controller;
