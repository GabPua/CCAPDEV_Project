const express = require('express');
const router = express.Router();
const homeTitle = 'ShefHub | Free Recipes & More';

router.get('/', function (req, res) {
    res.render('layout', {
        title: homeTitle
    });
});

router.get('/about', function(req, res) {
    res.render('layout', {
        title: homeTitle
    })
})

module.exports = router;