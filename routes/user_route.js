const express = require('express');
const ctrl = require('../controllers/user_ctrl');
const router = express.Router();

router.get('/newsfeed', ctrl.getNewsfeed);

router.get('/create', ctrl.getCreate);

router.get('/logout', ctrl.getLogout);

router.get('/:view/?', ctrl.getProfileView);

module.exports = router;
