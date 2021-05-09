const router = require('express')();
const ctrl = require('../controllers/comment_ctrl');

router.post('/add', ctrl.addComment);

router.post('/delete', ctrl.deleteComment);

module.exports = router;
