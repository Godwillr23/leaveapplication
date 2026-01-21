const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const leaveCtrl = require('../controllers/leaveController');

router.post('/apply', auth, leaveCtrl.applyLeave);
router.post('/:id/approve', auth, leaveCtrl.approveLeave);
router.post('/:id/decline', auth, leaveCtrl.declineLeave);
router.post('/:id/escalate', auth, leaveCtrl.escalateLeave);
router.get('/dashboard', auth, leaveCtrl.getDashboard);

module.exports = router;
