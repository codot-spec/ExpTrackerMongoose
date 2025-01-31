const Razorpay = require('razorpay');
const Order = require('../models/orders');
const User = require('../models/users'); // Import the User model
const userController = require('./user');

const purchasepremium = async (req, res) => {
    try {
        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const amount = 2500;

        rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
            if (err) {
                console.error("Razorpay order creation error:", err);
                return res.status(500).json({ message: 'Razorpay order creation failed', error: err.message }); // Send error message
            }

            try {
                const newOrder = new Order({
                    orderid: order.id,
                    status: 'PENDING',
                    userId: req.user._id, // Associate the order with the logged-in user
                });
                await newOrder.save();

                res.status(201).json({ order, key_id: rzp.key_id });
            } catch (dbErr) {
                console.error("Database error creating order:", dbErr);
                return res.status(500).json({ message: 'Database error creating order', error: dbErr.message }); // Send error message
            }
        });
    } catch (err) {
        console.error("Purchase premium error:", err);
        res.status(500).json({ message: 'Something went wrong', error: err.message }); // Send error message
    }
};

const updateTransactionStatus = async (req, res) => {
    try {
        const userId = req.user._id;
        const { payment_id, order_id } = req.body;

        const order = await Order.findOne({ orderid: order_id });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.userId.toString() !== userId.toString()) {  // VERY IMPORTANT!
            return res.status(403).json({ message: "Unauthorized to update this order" });
        }

        const promise1 = Order.updateOne({ orderid: order_id }, { paymentid: payment_id, status: 'SUCCESSFUL' });
        const promise2 = User.updateOne({ _id: userId }, { isPremium: true });

        await Promise.all([promise1, promise2]);

        res.status(202).json({
            success: true,
            message: "Transaction Successful",
            token: userController.generateAccessToken(userId, req.user.name, true), // Include name
        });
    } catch (err) {
        console.error("Update transaction status error:", err);
        res.status(500).json({ error: err.message, message: 'Something went wrong' }); // Send error message
    }
};

module.exports = {
    purchasepremium,
    updateTransactionStatus,
};