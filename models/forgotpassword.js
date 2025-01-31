// models/forgotpassword.js
const mongoose = require('mongoose');

const forgotpasswordSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true, 
    unique: true, // Ensure uniqueness for password reset requests
    index: true // Index the ID for faster lookups
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  active: { 
    type: Boolean, 
    default: true 
  },
  expiresby: { 
    type: Date, 
    default: () => new Date(Date.now() + 15 * 60 * 1000) // 15 minutes expiration
  },
}, { timestamps: true }); // Add timestamps for createdAt and updatedAt

// Add a virtual for easier expiration check (optional but recommended)
forgotpasswordSchema.virtual('isExpired').get(function() {
  return this.expiresby < Date.now() || !this.active; // Check both expiration and active status
});


const Forgotpassword = mongoose.model('Forgotpassword', forgotpasswordSchema);

module.exports = Forgotpassword;