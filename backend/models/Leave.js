const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['annual','maternity','paternity','family'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  days: { type: Number, required: true },
  reason: { type: String },
  status: { type: String, enum: ['Pending','Approved','Declined'], default: 'Pending' },
  department: { type: String },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Leave', LeaveSchema);
