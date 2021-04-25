const router = require('express')();
const ctrl = require('../controllers/signup_ctrl');

router.get('/', ctrl.getForm);

router.post('/', ctrl.postForm);

module.exports = router;