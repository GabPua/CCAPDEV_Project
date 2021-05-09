const router = require('express')();
const ctrl = require('../controllers/comment_ctrl');

router.post('/add', ctrl.addComment);

module.exports = router;
