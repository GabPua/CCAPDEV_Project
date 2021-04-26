const page_title = 'Shefhub | Login Page';

const login_controller = {
    getLogin: (req, res) => {
        if (req.session._id && req.cookies.user_sid) {
            res.redirect('/');
        } else {
            res.render('login', {
                title: page_title,
                login: true
            });
        }
    },

    postLogin: (req, res) => {
        // TODO: verify login here

        // create cookie
        req.session._id = 'chefjohn';

        res.redirect('/');
    }
}

module.exports = login_controller;
