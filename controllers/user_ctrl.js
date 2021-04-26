const db = require('../models/db');
const User = require('../models/user');

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
            let user;
            await User.findById( req.session._id, null, null, (err, result) => {
                user = result;
            }).lean().exec();

            console.log(user)

            res.render('profile', {
                    title: "YOUR PROFILE", // TODO: name?
                    user: user,
                    template: req.path.replace('/', ''),
                    helpers: {
                        ifEquals: (arg1, arg2, options) => {
                            return arg1 === arg2 ? options.fn(this) : options.inverse(this);
                        }
                    }
                }
            );
        });
    }
}

module.exports = user_controller;
