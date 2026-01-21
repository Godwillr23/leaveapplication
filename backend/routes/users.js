const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userCtrl = require('../controllers/userController');

router.post('/', auth, userCtrl.createUser);
router.get('/', auth, userCtrl.listUsers);
router.patch('/:id', auth, userCtrl.updateUser);
router.delete('/:id', auth, userCtrl.deleteUser);

module.exports = router;
