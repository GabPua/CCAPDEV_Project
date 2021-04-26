const express = require('express');
const ctrl = require('../controllers/home_ctrl');
const router = express.Router();
ctrl.getIndex
router.get('/', ctrl.getIndex);

router.get('/about', ctrl.getAbout);

router.get('/featured', ctrl.getFeatured);

module.exports = router;
