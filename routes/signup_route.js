const router = require('express')();
const ctrl = require('../controllers/signup_ctrl');

router.get('/', ctrl.getSignup);
router.get('/getCheckUsername', ctrl.getCheckUsername);

router.post('/', ctrl.postSignup);

module.exports = router;