const page_title = 'ShefHub | Free Recipes & More';

const home_controller = {
    getIndex: (req, res) => {
        res.render('home', {
            title: page_title
        });
    },

    getAbout: (req, res) => {
        res.render('about', {
            title: page_title
        });
    },

    getExplore: (req, res) => {
        res.render('explore', {
            title: page_title
        });
    }
}

module.exports = home_controller;
