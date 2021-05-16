const router = require('express')();
const ctrl = require('../controllers/user_ctrl');

router.all(['/profile', '/posts', '/following', '/followers', '/logout', '/search', '/user/:id',
                    '/user/:id/posts', '/user/:id/likes', '/deleteAccount'], ctrl.verifySession);

router.route('/profile')
    .get(ctrl.getProfile)
    .post(ctrl.postProfile);

router.get(['/posts', '/likes'], ctrl.getPosts);

router.get(['/following', '/followers'], ctrl.getFollow);

router.get('/user/:id', ctrl.getProfile);

router.get(['/user/:id/posts', '/user/:id/likes'], ctrl.getPosts);

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

router.post('/deleteAccount', ctrl.deleteAccount);

module.exports = router;
