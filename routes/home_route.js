const express = require('express');
const router = express.Router();
const homeTitle = 'ShefHub | Free Recipes & More';

router.get('/', function (req, res) {
    // show newsfeed if logged in, else show homepage
    // req.session.name = 'MasterChef1001';
    res.render(req.session.name? 'newsfeed' : 'home', {
        title: homeTitle,
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

router.get('/signup', function(req, res) {
    res.render('signup', {
        title: 'Sign up @ ShefHub',
        signup: true
    });
});

router.get('/login', function(req, res) {
    res.render('login', {
        title: 'Log in @ ShefHub',
        login: true
    });
});

module.exports = router;
