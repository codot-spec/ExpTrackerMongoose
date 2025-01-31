const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  paymentid: String,
  orderid: String,
  status: {
    type: String,
    enum: ['PENDING', 'SUCCESSFUL', 'FAILED'], // Use enum for possible statuses
    default: 'PENDING',
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Add userId and reference User
}, { timestamps: true }); // Add timestamps

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;