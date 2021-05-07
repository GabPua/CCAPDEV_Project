const router = require('express')();
const ctrl = require('../controllers/user_ctrl');

router.route('/create')
    .get(ctrl.getCreate)
    .post(ctrl.postCreate);

router.route('/profile')
    .get(ctrl.getProfile)
    .post(ctrl.postProfile);

router.get(['/posts', 'likes'], ctrl.getPosts);

router.get(['/following', '/followers'], ctrl.getFollow);

router.get('/user/:id', ctrl.getProfile);

router.get(['/user/:id/posts', '/user/:id/likes'], ctrl.getPosts);

router.get('/post/:id', ctrl.getRecipe);

router.post('/post/delete', ctrl.deletePost);

router.get('/search', ctrl.getSearch);

router.get('/logout', ctrl.getLogout);

router.get('/getCheckEmail', ctrl.getCheckEmail);

router.post('/verifyPassword', ctrl.verifyPassword);

router.post('/updatePassword', ctrl.updatePassword);

router.get('/getCheckProf', ctrl.getCheckProf);

router.get('/getCheckPlace', ctrl.getCheckPlace);

router.get('/getCheckDesc', ctrl.getCheckDesc);

router.route('/follow')
    .get(ctrl.getCheckFollow)
    .post(ctrl.postFollow);

router.get('/getDeleteAccount', ctrl.getDeleteAccount);

module.exports = router;
