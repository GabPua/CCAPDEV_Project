const express = require('express');
const ctrl = require('../controllers/user_ctrl');
const router = express.Router();

router.get('/create', ctrl.getCreate);

router.get('/logout', ctrl.getLogout);

router.get(['/profile', '/posts', '/likes', '/following', '/followers'], ctrl.getProfileView);

router.get('/search', ctrl.getSearch);

module.exports = router;
