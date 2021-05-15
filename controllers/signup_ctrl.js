const async = require('async');

function isValidPassword(pw) {
    const re = /\d/g;

    if (pw == null || pw.trim() === '') {
        return false;
    } else {
        return re.test(pw);
    }
}

function isValidUsername(name) {
    return !(name == null || name === '');
}

function isValidEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    return re.test(String(email).toLowerCase());
}

const User = require('../models/user');

const signup_ctrl = {
    getSignup: (req, res) => {
        if (req.session._id && req.cookies.user_sid) {
            res.redirect('/');
        } else {
            res.render('signup', {
                title: 'Sign up | ShefHub',
                signup: true
            });
        }
    },

    postSignup: (req, res) => {
        const { email, name, password, tandc } = req.body;

        // final check before creating account
        let isValid = isValidEmail(email) && isValidPassword(password) && isValidUsername(name) && tandc === 'on';

        async.waterfall([
            function isNotTaken(callback) {
                if (isValid) {
                    User.findById(name, '_id', null, (err, result) => {
                        if (err) {
                            callback(err);
                        } else if (result == null || result._id !== name) {
                            callback(null);
                        } else {
                            callback(true);
                        }
                    });
                } else {
                    callback(true);
                }
            },

            function createUser(callback) {
                let user = {
                    _id: name,
                    email: email,
                    password: password,
                    picture_path: '/public/img/profile/default_dp.jpg'
                };

                User.create(user, (err) => {
                    callback(err);
                });
            }
        ], (err) => {
            if (!err) {
                req.session._id = name.toLowerCase();
                req.session.picture_path = '/public/img/profile/default_dp.jpg';
                res.redirect('/profile');
            } else {
                res.render('signup', {
                    title: 'Sign up | ShefHub',
                    signup: true,
                    email: email,
                    name: name
                });
            }
        });
    },

    getCheckUsername: (req, res) => {
        let name = req.query._id;

        User.findById(name, '_id', null, (err, result) => {
            res.send(result);
        }).lean();
    },

    getCheckEmail: (req, res) => {
        let email = req.query.email;

        User.findOne({email: email}, 'email', null, (err, result) => {
            res.send(result);
        }).lean();
    }
};

module.exports = signup_ctrl;