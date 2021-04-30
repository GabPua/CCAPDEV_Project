const router = require('express')();
const ctrl = require('../controllers/user_ctrl');

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

router.get('/getCheckEmail', ctrl.getCheckEmail);

router.get('/getCheckPassword', ctrl.getCheckPassword);

router.get('/getCheckProf', ctrl.getCheckProf);

router.get('/getCheckPlace', ctrl.getCheckPlace);

router.get('/getCheckDesc', ctrl.getCheckDesc);

router.route('/follow')
    .get(ctrl.getCheckFollow)
    .post(ctrl.postFollow);

module.exports = router;
