const connectDB = require('../config/db');
const mongoose = require('mongoose');
const User = require('../models/User');

connectDB();

mongoose.connection.on('connected', async () => {
  console.log('Mongo connected — initializing annualRemaining for users');
  try {
    const users = await User.find({}).select('annualEntitlement annualRemaining email');
    for (const u of users) {
      const entitlement = (typeof u.annualEntitlement === 'number') ? u.annualEntitlement : 18;
      if (typeof u.annualRemaining !== 'number') {
        u.annualRemaining = entitlement;
        await u.save();
        console.log(`Initialized ${u.email} -> ${u.annualRemaining}`);
      }
    }
    console.log('Initialization complete.');
  } catch (err) {
    console.error('Migration failed', err);
    } finally {
      // mongoose v7: close() no longer accepts a callback
      try {
        await mongoose.connection.close();
      } catch (e) {
        // ignore
      }
      process.exit(0);
    }
});

mongoose.connection.on('error', err => {
  console.error('Mongo connection error', err);
  process.exit(1);
});
