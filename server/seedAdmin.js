// Run once:  npm run seed   (creates an admin account)
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const email = 'admin@ridetogether.com';
  if (await User.findOne({ email })) {
    console.log('Admin already exists');
  } else {
    await User.create({ name: 'Admin', email, phone: '9999999999', password: 'admin123', role: 'admin' });
    console.log('Admin created -> email: admin@ridetogether.com  password: admin123');
  }
  await mongoose.disconnect();
})();
