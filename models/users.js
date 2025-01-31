const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    required: true, // Email should be required
  },
  password: {
    type: String,
    required: true, // Password should be required
  },
  totalExpenses: {
    type: Number,
    default: 0,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true }); // Add timestamps

const User = mongoose.model('User', userSchema);

module.exports = User;