const dotenv = require('dotenv')
const crypto = require('crypto-js');

dotenv.config();
const key = process.env.SECRET || 'hushPuppy1234';

function isValidPassword(pw) {
    if (pw === '') {
        return false;
    } else if (pw == null) {    // TODO: Addition check stuff
        return false;
    } else {
        return true;
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

    postSignup: async (req, res) => {
        const { email, name, password, tandc } = req.body;

        // final check before creating account
        let isValid = isValidEmail(email) && isValidPassword(password) && isValidUsername(name) && tandc === 'on';
        
        await User.findById(name, '_id', null, (err, result) => {
            if (result !== null && result._id === name) {
                isValid = false;
            }
        }).exec();

        if (isValid) {
            let user = {
                _id: name,
                email: email,
                password: crypto.AES.encrypt(password, key).toString()
            };

            User.create(user, (err) => {
                if (err) {
                    console.log(err);
                    res.redirect('/');
                } else {
                    req.session._id = name;
                    res.redirect('/profile');
                }
            });
        } else {
            res.render('signup', {
                title: 'Sign up | ShefHub',
                signup: true,
                email: email,
                name: name
            });
        }
    },

    getCheckUsername: async (req, res) => {
        let name = req.query._id;
        console.log(name);

        await User.findById(name, '_id', null, (err, result) => {
            console.log(result);
            res.send(result);
        }).lean().exec();
    }
};

module.exports = signup_ctrl;