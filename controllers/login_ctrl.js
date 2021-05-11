const dotenv = require('dotenv')
const crypto = require('crypto-js');
const User = require('../models/user');
const async = require('async');

dotenv.config();
const key = process.env.SECRET || 'hushPuppy123';

const page_title = 'Shefhub | Login Page';

const login_controller = {
    getLogin: (req, res) => {
        if (req.session._id && req.cookies.user_sid) {
            res.redirect('/');
        } else {
            res.render('login', {
                title: page_title,
                login: true,
            });
        }
    },

    postLogin: (req, res) => {
        const { _id, password } = req.body;

        async.waterfall([
            function findUser(callback) {
                User.findById(_id, 'password picture_path', null, (err, result) => {
                    callback(err, result && password === crypto.AES.decrypt(result.password, key).toString(crypto.enc.Utf8), result?.picture_path);
                });
            }
        ], (err, isSuccess, picturePath) => {
            if (isSuccess) {
                req.session._id = _id.toLowerCase();
                req.session.picture_path = picturePath;
                res.redirect('/');
            } else {
                res.render('login', {
                    title: page_title,
                    login: true,
                    id: _id
                });
            }
        });
    }
}

module.exports = login_controller;
