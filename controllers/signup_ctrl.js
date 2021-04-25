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


const signup_ctrl = {
    getForm: (req, res) => {
        res.render('signup', {
            title: 'Sign up @ ShefHub',
            signup: true
        });
    },

    postForm: (req, res) => {
        const { email, name, password, tandc } = req.body;

        if (isValidEmail(email) && isValidUsername(name) && isValidPassword(password) && tandc === 'on') {
            return res.redirect('/newsfeed');
        }
        return res.redirect('/signup');
    },
};

module.exports = signup_ctrl;