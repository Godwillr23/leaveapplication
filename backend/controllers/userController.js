const User = require('../models/User');

exports.createUser = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'hr') return res.status(403).json({ msg: 'Forbidden' });
    const { name, email, password, role = 'employee', department, managerId, hireDate } = req.body;
    if (!name || !email || !password) return res.status(400).json({ msg: 'Name, email and password are required' });
    let exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'User already exists' });
    // If role is employee, manager is required
    if (role === 'employee' && !managerId) return res.status(400).json({ msg: 'Manager is required for employees' });
    // If managerId provided, validate manager exists and is a manager
    if (managerId) {
      const mgr = await User.findById(managerId);
      if (!mgr) return res.status(400).json({ msg: 'Manager not found' });
      if (mgr.role !== 'manager') return res.status(400).json({ msg: 'Selected manager must have role "manager"' });
    }
    const user = new User({ name, email, password, role, department, manager: managerId || null, hireDate });
    await user.save();
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.listUsers = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'hr') return res.status(403).json({ msg: 'Forbidden' });
    // include manager reference so frontend can show/select current manager
    const users = await User.find().select('name email role department manager').populate('manager', 'name');
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'hr') return res.status(403).json({ msg: 'Forbidden' });
    const { role, department, managerId, name, email } = req.body;
    const existing = await User.findById(req.params.id);
    if (!existing) return res.status(404).json({ msg: 'User not found' });
    const finalRole = role || existing.role;
    // If after update the role is employee, ensure a manager exists (either provided or already set)
    if (finalRole === 'employee') {
      const mgrToCheck = managerId !== undefined ? managerId : existing.manager;
      if (!mgrToCheck) return res.status(400).json({ msg: 'Manager is required for employees' });
      if (managerId) {
        const mgr = await User.findById(managerId);
        if (!mgr) return res.status(400).json({ msg: 'Manager not found' });
        if (mgr.role !== 'manager') return res.status(400).json({ msg: 'Selected manager must have role "manager"' });
      }
    }
    // If email is provided and changed, validate format and uniqueness
    if (email && email !== existing.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ msg: 'Valid email required' });
      const other = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (other) return res.status(400).json({ msg: 'Email already in use' });
    }
    const updates = {};
    if (role) updates.role = role;
    if (department !== undefined) updates.department = department;
    if (managerId !== undefined) updates.manager = managerId || null;
    if (email !== undefined) updates.email = email;
    if (name) updates.name = name;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('name email role department');
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'hr') return res.status(403).json({ msg: 'Forbidden' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
