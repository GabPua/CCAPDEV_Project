const router = require('express')();
const ctrl = require('../controllers/login_ctrl');

router.route('/')
    .get(ctrl.getLogin)
    .post(ctrl.postLogin);

module.exports = router;
