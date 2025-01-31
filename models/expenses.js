const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference User model
}, { timestamps: true }); // Add timestamps for createdAt and updatedAt

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;