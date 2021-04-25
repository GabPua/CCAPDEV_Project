// checks if the credentials inside the cookie are valid
function verifyUser (req, res) {
    // console.log(req.session);
    // console.log(req.cookies);
    // if (!(req.session.name && req.cookies.user_sid)) {
    //     res.redirect('/');
    // }
}

const user_controller = {
    getNewsfeed: (req, res) => {
        verifyUser(req, res);
        res.render('newsfeed', {
            title: 'Your page'
        });
    },

    getCreate: (req, res) => {
        verifyUser(req, res);
        res.render('create', {
            title: 'Create a new recipe'
        });
    },

    getLogout: (req, res) => {
        verifyUser(req, res);
        req.session.destroy();
        res.clearCookie('user_sid');
        res.redirect('/');
    },

    getProfileView: (req, res) => {
        verifyUser(req, res);
        res.render('profile', {
                title: "YOUR PROFILE", // TODO: name?
                user: req.session.user,
                template: req.params.view
            },
            (err, html) => {
                if (err) {
                    res.status(404).send('File not in server!');
                }
                res.send(html);
            }
        );
    }
}

module.exports = user_controller;
