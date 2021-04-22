const express = require('express');
const router = express.Router();
const homeTitle = 'ShefHub | Free Recipes & More';

router.get('/', function (req, res) {
    res.render('home', {
        title: homeTitle,
    });
});

router.get('/about', function(req, res) {
    res.render('about', {
        title: homeTitle
    })
})

router.get('/explore', function(req, res) {
    res.render('explore', {
        title: homeTitle
    })
})

module.exports = router;