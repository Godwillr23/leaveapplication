const Leave = require('../models/Leave');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mailer = require('../utils/mailer');

function monthsBetween(a, b) {
  const years = b.getFullYear() - a.getFullYear();
  const months = b.getMonth() - a.getMonth();
  return years * 12 + months;
}

async function calculateAccrued(user) {
  const months = Math.max(0, monthsBetween(new Date(user.hireDate), new Date()));
  const accrued = Math.min(18, months * 1.5);
  const takenAgg = await Leave.aggregate([
    { $match: { applicant: user._id, status: 'Approved' } },
    { $group: { _id: null, total: { $sum: '$days' } } }
  ]);
  const taken = (takenAgg[0] && takenAgg[0].total) || 0;
  return { accrued, taken, remaining: Math.max(0, accrued - taken) };
}

exports.applyLeave = async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);
    // disallow start dates that are today or in the past
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const today = new Date();
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (startDay <= todayDay) return res.status(400).json({ msg: 'Start date must be after today' });
    const ms = 24*60*60*1000;
    const days = Math.ceil((end - start) / ms) + 1;
    if (days <= 0) return res.status(400).json({ msg: 'Invalid dates' });
    const user = req.user;
    const accrual = await calculateAccrued(user);
    if (type === 'annual' && days > accrual.remaining) return res.status(400).json({ msg: 'Not enough annual leave remaining', remaining: accrual.remaining });
    const leave = new Leave({ applicant: user._id, type, startDate: start, endDate: end, days, reason, department: user.department, manager: user.manager });
    await leave.save();
    // notify manager (email + in-app notification)
    if (user.manager) {
      const manager = await User.findById(user.manager);
      if (manager) {
        mailer.sendMail(manager.email, 'Leave application pending', `Employee ${user.name} applied for leave (${type}) from ${start.toDateString()} to ${end.toDateString()} (${days} days).`);
        await Notification.create({ user: manager._id, type: 'leave_pending', message: `Employee ${user.name} applied for ${type} leave (${days} days).`, link: `/leaves/${leave._id}` });
      }
    }
    // also notify HR users in-app so HR sees pending counts
    const hrUsersApply = await User.find({ role: 'hr' });
    for (const h of hrUsersApply) {
      await Notification.create({ user: h._id, type: 'leave_pending', message: `New leave pending: ${user.name} applied for ${type} (${days} days).`, link: `/leaves/${leave._id}` });
    }
    res.json({ leave });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate('applicant');
    if (!leave) return res.status(404).json({ msg: 'Leave not found' });
    // only manager can approve
    if (req.user.role !== 'manager') return res.status(403).json({ msg: 'Forbidden' });
    if (String(leave.manager) !== String(req.user._id) && leave.applicant.manager && String(leave.applicant.manager) !== String(req.user._id)) return res.status(403).json({ msg: 'Not the manager for this employee' });
    // check remaining for annual
    const accrual = await calculateAccrued(leave.applicant);
    if (leave.type === 'annual' && leave.days > accrual.remaining) return res.status(400).json({ msg: 'Not enough annual leave remaining' });
    leave.status = 'Approved';
    await leave.save();
    // notify employee (email + in-app) and HR (email + in-app)
    mailer.sendMail(leave.applicant.email, 'Leave approved', `Your leave (${leave.type}) from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} was approved.`);
    await Notification.create({ user: leave.applicant._id, type: 'leave_approved', message: `Your leave (${leave.type}) from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} was approved.`, link: `/leaves/${leave._id}` });
    if (process.env.HR_EMAIL) mailer.sendMail(process.env.HR_EMAIL, 'Leave approved', `Leave for ${leave.applicant.name} approved by ${req.user.name}.`);
    // notify all HR users in-app
    const hrUsers = await User.find({ role: 'hr' });
    for (const h of hrUsers) {
      await Notification.create({ user: h._id, type: 'leave_approved', message: `Leave for ${leave.applicant.name} was approved by ${req.user.name}.`, link: `/leaves/${leave._id}` });
    }
    res.json({ leave });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.declineLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate('applicant');
    if (!leave) return res.status(404).json({ msg: 'Leave not found' });
    if (req.user.role !== 'manager') return res.status(403).json({ msg: 'Forbidden' });
    if (String(leave.manager) !== String(req.user._id) && leave.applicant.manager && String(leave.applicant.manager) !== String(req.user._id)) return res.status(403).json({ msg: 'Not the manager for this employee' });
    leave.status = 'Declined';
    await leave.save();
    mailer.sendMail(leave.applicant.email, 'Leave declined', `Your leave (${leave.type}) from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} was declined.`);
    await Notification.create({ user: leave.applicant._id, type: 'leave_declined', message: `Your leave (${leave.type}) from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} was declined.`, link: `/leaves/${leave._id}` });
    if (process.env.HR_EMAIL) mailer.sendMail(process.env.HR_EMAIL, 'Leave declined', `Leave for ${leave.applicant.name} declined by ${req.user.name}.`);
    const hrUsersDecline = await User.find({ role: 'hr' });
    for (const h of hrUsersDecline) {
      await Notification.create({ user: h._id, type: 'leave_declined', message: `Leave for ${leave.applicant.name} was declined by ${req.user.name}.`, link: `/leaves/${leave._id}` });
    }
    res.json({ leave });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const user = req.user;
    if (user.role === 'employee') {
      const leaves = await Leave.find({ applicant: user._id }).sort({ createdAt: -1 });
      const accrual = await calculateAccrued(user);
      const unreadNotifications = await Notification.countDocuments({ user: user._id, read: false });
      return res.json({ leaves, accrual, unreadNotifications });
    }
    if (user.role === 'manager') {
      const leaves = await Leave.find({ department: user.department }).populate('applicant').sort({ createdAt: -1 });
      const pendingCount = await Leave.countDocuments({ department: user.department, status: 'Pending' });
      const unreadNotifications = await Notification.countDocuments({ user: user._id, read: false });
      return res.json({ leaves, pendingCount, unreadNotifications });
    }
    if (user.role === 'hr') {
      const leaves = await Leave.find().populate('applicant').sort({ createdAt: -1 });
      const pendingCount = await Leave.countDocuments({ status: 'Pending' });
      const unreadNotifications = await Notification.countDocuments({ user: user._id, read: false });
      return res.json({ leaves, pendingCount, unreadNotifications });
    }
    res.status(403).json({ msg: 'Role not supported' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.escalateLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate('applicant');
    if (!leave) return res.status(404).json({ msg: 'Leave not found' });
    // only HR or manager can escalate
    if (req.user.role !== 'hr' && req.user.role !== 'manager') return res.status(403).json({ msg: 'Forbidden' });
    if (leave.status !== 'Pending') return res.status(400).json({ msg: 'Only pending leaves can be escalated' });
    // notify manager and HR
    if (leave.manager) {
      const manager = await User.findById(leave.manager);
      if (manager) {
        const subject = 'Leave escalation — please review pending application';
        const body = `Please review the pending leave application for ${leave.applicant.name} (${leave.type}) from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} (${leave.days} days). Escalated by ${req.user.name}.`;
        mailer.sendMail(manager.email, subject, body);
        await Notification.create({ user: manager._id, type: 'leave_escalation', message: `Please review leave for ${leave.applicant.name} (${leave.type}) from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}.`, link: `/leaves/${leave._id}` });
      }
    }
    if (process.env.HR_EMAIL) mailer.sendMail(process.env.HR_EMAIL, 'Leave escalation', `Leave for ${leave.applicant.name} has been escalated by ${req.user.name}.`);
    res.json({ msg: 'Escalation notifications sent' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
