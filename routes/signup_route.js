const router = require('express')();
const ctrl = require('../controllers/signup_ctrl');

router.route('/')
    .get(ctrl.getSignup)
    .post(ctrl.postSignup);

router.get('/getCheckUsername', ctrl.getCheckUsername);

router.get('/getCheckEmail', ctrl.getCheckEmail);

module.exports = router;
