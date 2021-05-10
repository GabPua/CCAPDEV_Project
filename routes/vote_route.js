const router = require('express')();
const ctrl = require('../controllers/vote_ctrl');

router.post('/delete', ctrl.deleteVote);

router.post('/update', ctrl.updateVote);

router.post('/add', ctrl.addVote);

module.exports = router;
