const express = require('express');
const router = express.Router();
const homeTitle = 'ShefHub | Free Recipes & More';

function verifyUser (req, res) {
    // console.log(req.session);
    // console.log(req.cookies);
    if (!(req.session.name && req.cookies.user_sid)) {
        res.redirect('/');
    }
}

const sessionChecker = (req, res, next) => {
    if (req.session.name && req.cookies.user_sid) {
        res.redirect('/newsfeed');
    } else {
        next();
    }
}

router.get('/', sessionChecker, (req, res) => {
    // req.session.name = 'MasterChef1001';
    res.render('home', {
        title: homeTitle
    });
});

router.get('/about', function(req, res) {
    res.render('about', {
        title: homeTitle
    });
});

router.get('/explore', function(req, res) {
    res.render('explore', {
        title: homeTitle
    });
});

router.get('/login', function(req, res) {
    res.render('login', {
        title: 'Log in @ ShefHub',
        login: true
    });
});

// logged-in only pages

router.get('/logout', function(req, res) {
    verifyUser(req, res);
    req.session.destroy();
    res.clearCookie('user_sid');
    res.redirect('/');
});

router.get('/newsfeed', function(req, res) {
    verifyUser(req, res);
    res.render('newsfeed', {
        title: homeTitle
    });
});

router.get('/create', function(req, res) {
    verifyUser(req, res);
    res.render('create', {
        title: 'Create a new recipe'
    });
});

router.get('/:view/?', (req, res, next) => {
    verifyUser(req, res);
    res.render('profile', {
        title: "YOUR PROFILE", // TODO: name?
        template: req.params.view
    },
    (err, html) => {
        if (err) {
            res.status(404).send('File not in server!');
        }
        res.send(html);
    });
});

module.exports = router;
