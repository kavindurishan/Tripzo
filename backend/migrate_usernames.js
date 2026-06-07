require('dotenv').config();
const mongoose = require('mongoose');

// Schemas Definitions for MongoDB Mongoose
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, sparse: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Operator', 'Customer'], default: 'Customer' },
  status: { type: String, enum: ['Active', 'Blocked'], default: 'Active' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    const users = await User.find({ username: { $exists: false } });
    console.log(`Found ${users.length} users without a username.`);

    let count = 0;
    for (let user of users) {
      // Generate username from email
      let baseUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      let username = baseUsername;
      
      // Ensure unique username
      let unique = false;
      let suffix = 1;
      while (!unique) {
        const existing = await User.findOne({ username });
        if (!existing) {
          unique = true;
        } else {
          username = `${baseUsername}${suffix}`;
          suffix++;
        }
      }

      user.username = username;
      await user.save();
      count++;
      console.log(`Updated user ${user.email} with username: ${username}`);
    }

    console.log(`Successfully updated ${count} users.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
