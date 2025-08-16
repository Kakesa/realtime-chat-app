const router = require('express').Router();
const auth = require('../middleware/auth');
const { createGroup, myGroups, addMember } = require('../controllers/groupController');

router.use(auth);
router.post('/', createGroup);
router.get('/mine', myGroups);
router.post('/:groupId/members', addMember);

module.exports = router;
