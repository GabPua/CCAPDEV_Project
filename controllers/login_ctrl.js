const page_title = 'Shefhub | Login Page';

const login_controller = {
    getLogin: (req, res) => {
        res.render('login', {
            title: page_title,
            login: true
        });
    },

    postLogin: (req, res) => {
        // TODO: verify login here

        // create cookie
        req.session.name = 'MasterChef1001';
        req.session.password = 'encryptedpasswordhere';

        res.redirect('/newsfeed');
    }
}

module.exports = login_controller;
