const mongoose = require('mongoose');
const connectDB = require('../config/db.config'); // adjust path if needed
const User = require('../models/User');

const updateRoles = async () => {
  try {
    await connectDB();

    // Organizer
    /*await User.findOneAndUpdate(
      { email: 'monalkavithra2@gmail.com' },
      { role: 'organizer' }
    );*/

    // Admin
    await User.findOneAndUpdate(
      { email: 'monalwickramasinghe@gmail.com' },
      { role: 'admin' }
    );

    console.log('✅ Roles updated successfully');

    process.exit();
  } catch (error) {
    console.error('❌ Error updating roles:', error);
    process.exit(1);
  }
};

updateRoles();