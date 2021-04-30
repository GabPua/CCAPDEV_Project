const page_title = 'ShefHub | Free Recipes & More';

const home_controller = {
    getIndex: (req, res) => {
        if (req.session._id && req.cookies.user_sid) {
            require('./user_ctrl').getNewsfeed(req, res);
        } else {
            res.render('home', {
                title: page_title
            });
        }
    },

    getAbout: (req, res) => {
        res.render('about', {
            title: page_title
        });
    },

    getFeatured: (req, res) => {
        res.render('featured', {
            title: page_title
        });
    }
}

module.exports = home_controller;
