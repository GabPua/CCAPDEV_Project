const dotenv = require('dotenv')
const crypto = require('crypto-js');
const User = require('../models/user');
const page_title = 'Shefhub | Login Page';

dotenv.config();
const key = process.env.SECRET || 'hushPuppy123';

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

    postLogin: async (req, res) => {
        const { _id, password } = req.body;
        let isSuccess;

        await User.findById(_id, 'password', null, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                isSuccess = result != null && password === crypto.AES.decrypt(result.password, key).toString(crypto.enc.Utf8);
            }
        }).exec();

        // create cookie
        if (isSuccess) {
            req.session._id = _id;
            res.redirect('/');
        } else {
            res.render('login', {
                title: page_title,
                login: true,
                id: _id
            });
        }
    }
}

module.exports = login_controller;
