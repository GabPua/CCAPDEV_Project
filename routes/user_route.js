const express = require('express');
const ctrl = require('../controllers/user_ctrl');
const router = express.Router();

router.route('/create')
    .get(ctrl.getCreate)
    .post(ctrl.postCreate);

router.route('/profile')
    .get(ctrl.getProfile)
    .post(ctrl.postProfile);

router.get('/posts', ctrl.getPosts);

router.get('/likes', ctrl.getLikes);

router.get('/following', ctrl.getFollowing);

router.get('/followers', ctrl.getFollowers);

router.get('/search', ctrl.getSearch);

router.get('/logout', ctrl.getLogout);

module.exports = router;
