const express = require('express');
const ctrl = require('../controllers/home_ctrl');
const router = express.Router();



const sessionChecker = (req, res, next) => {
    if (req.session.name && req.cookies.user_sid) {
        res.redirect('/newsfeed');
    } else {
        next();
    }
}

router.get('/', ctrl.getIndex);

router.get('/about', ctrl.getAbout);

router.get('/explore', ctrl.getExplore);

module.exports = router;
