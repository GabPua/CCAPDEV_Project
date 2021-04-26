const express = require('express');
const ctrl = require('../controllers/user_ctrl');
const router = express.Router();

router.get('/create', ctrl.getCreate);

router.get('/logout', ctrl.getLogout);

router.get(['/profile', '/posts', '/likes', '/following', '/followers'], ctrl.getProfileView);

module.exports = router;
