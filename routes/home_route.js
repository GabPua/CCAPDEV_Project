const express = require('express');
const router = express.Router();
const homeTitle = 'ShefHub | Free Recipes & More';

function verifyUser (req, res) {
    console.log(req.session);
    console.log(req.cookies);
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

router.route('/signup')
    .get((req, res) => {
        res.render('signup', {
            title: 'Sign up @ ShefHub',
            signup: true
        });
    })
    .post((req, res) => {
        // TODO: registration
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

router.get('/:view', (req, res, next) => {
    verifyUser(req, res);
    try {
        res.render(req.params.view, {
            title: "HELLO"
        });
    } catch (err) {
        next();
    }
});

module.exports = router;
