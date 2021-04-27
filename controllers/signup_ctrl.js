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

        let user = {
            _id: name,
            email: email,
            password: password
        };

        await User.create(user, (err, result) => {
            res.redirect('/');
        }).lean().exec();

        // if (isValidEmail(email) && isValidUsername(name) && isValidPassword(password) && tandc === 'on') {

        //     return res.redirect('/newsfeed');
        // }
        // return res.redirect('/signup');
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