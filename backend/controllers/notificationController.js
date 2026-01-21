const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const user = req.user;
    const notifications = await Notification.find({ user: user._id }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ user: user._id, read: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.markRead = async (req, res) => {
  try {
    const n = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!n) return res.status(404).json({ msg: 'Notification not found' });
    res.json({ notification: n });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
