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
    if (name === '') {
        return false;
    } else if (name == null) { // TODO: Additional check stuff
        return false;
    } else {
        return true;
    }
}

function isValidEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    if (re.test(String(email).toLowerCase())) {
        return true;
    } else {
        return false;
    }
}

const db = require('../models/db');
const User = require('../models/user');

const signup_ctrl = {
    getSignup: (req, res) => {
        res.render('signup', {
            title: 'Sign up @ ShefHub',
            signup: true
        });
    },

    postSignup: (req, res) => {
        const { email, name, password, tandc } = req.body;

        let user = {
            _id: name,
            email: email,
            password: password,
            followers: [],
            following: []
        };

        db.insertOne(User, user, function (flag) {
            if (flag) {
                res.redirect('/newsfeed');
            }
        })

        // if (isValidEmail(email) && isValidUsername(name) && isValidPassword(password) && tandc === 'on') {

        //     return res.redirect('/newsfeed');
        // }
        // return res.redirect('/signup');
    },

    getCheckUsername: (req, res) => {
        let name = req.query._id;
        console.log(name);

        db.findOne(User, {_id: name}, '_id', function (result) {
            console.log(result);
            res.send(result);
        });
    }
};

module.exports = signup_ctrl;