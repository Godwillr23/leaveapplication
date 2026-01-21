const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  const { name, email, password, role, department, managerId, hireDate } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });
    user = new User({ name, email, password, role, department, manager: managerId || null, hireDate });
    await user.save();
    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'change_this', { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET || 'change_this', { expiresIn: '30d' });
    user.refreshToken = refreshToken;
    await user.save();
    res.json({ token, refreshToken, user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department } });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'change_this', { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET || 'change_this', { expiresIn: '30d' });
    user.refreshToken = refreshToken;
    await user.save();
    res.json({ token, refreshToken, user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department } });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ msg: 'No refresh token provided' });
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'change_this');
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) return res.status(401).json({ msg: 'Invalid refresh token' });
    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'change_this', { expiresIn: '15m' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: 'Refresh token invalid or expired' });
  }
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ msg: 'No refresh token' });
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'change_this');
    const user = await User.findById(decoded.id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.json({ msg: 'Logged out' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ msg: 'Invalid token' });
  }
};
