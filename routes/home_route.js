const router = require('express')();
const ctrl = require('../controllers/home_ctrl');

router.get('/', ctrl.getIndex);

router.get('/about', ctrl.getAbout);

router.get('/featured', ctrl.getFeatured);

module.exports = router;
