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

router.get(['/following', '/followers'], ctrl.getFollow);

router.get('/user/:id', ctrl.getProfile);

router.get('/user/:id/posts', ctrl.getPosts);

router.get('/user/:id/likes', ctrl.getLikes);

router.get('/post/:id', ctrl.getRecipe);

router.get('/search', ctrl.getSearch);

router.get('/logout', ctrl.getLogout);

module.exports = router;
