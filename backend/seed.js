require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

(async () => {
  try {
    connectDB();
    // wait a moment for connection
    await new Promise(r => setTimeout(r, 1000));
    // clear
    await User.deleteMany({});
    const hr = new User({ name: 'HR User', email: 'hr@company.com', password: 'password', role: 'hr' });
    await hr.save();
    const manager = new User({ name: 'Manager One', email: 'manager@company.com', password: 'password', role: 'manager', department: 'Engineering' });
    await manager.save();
    const employee = new User({ name: 'Employee One', email: 'employee@company.com', password: 'password', role: 'employee', department: 'Engineering', manager: manager._id, hireDate: new Date(new Date().setFullYear(new Date().getFullYear()-1)) });
    await employee.save();
    console.log('Seeded HR, Manager, Employee (password = password)');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
