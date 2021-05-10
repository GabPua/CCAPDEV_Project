const router = require('express')();
const ctrl = require('../controllers/post_ctrl');

router.route('/create')
    .get(ctrl.getCreateForm)
    .post(ctrl.insertToDB);

router.get('/:id', ctrl.getRecipe);

router.post('/delete', ctrl.deletePost);

router.route('/edit/:id')
    .get(ctrl.editPost)
    .post(ctrl.insertToDB);

module.exports = router;
