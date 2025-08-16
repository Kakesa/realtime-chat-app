const router = require('express').Router();
const auth = require('../middleware/auth');
const { history } = require('../controllers/messageController');

router.use(auth);
router.get('/', history);

module.exports = router;
