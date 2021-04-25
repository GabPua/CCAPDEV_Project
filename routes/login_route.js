const express = require('express');
const ctrl = require('../controllers/login_ctrl');
const router = express.Router();

router.get('/', ctrl.getLogin);

router.post('/', ctrl.postLogin);

module.exports = router;
