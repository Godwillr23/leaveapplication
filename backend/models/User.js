const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['employee','manager','hr'], default: 'employee' },
  department: { type: String },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  refreshToken: { type: String },
  hireDate: { type: Date, default: Date.now },
  // annual entitlement persisted in DB so remaining can be updated on apply/decline
  annualEntitlement: { type: Number, default: 18 },
  annualRemaining: { type: Number, default: 18 }
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);
