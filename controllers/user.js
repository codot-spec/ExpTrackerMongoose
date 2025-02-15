const User = require('../models/users');
const Expenses = require('../models/expenses');
const Orders = require('../models/orders');
const ContentLoaded = require('../models/contentloaded');
const ForgotPassword = require('../models/forgotpassword');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(403).json({ message: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        console.error("Error in adding user:", err);
        res.status(500).json({ message: "Failed to add user", error: err.message });
    }
};

exports.generateAccessToken = (id, name, isPremium) => {
    return jwt.sign({ userId: id, name, isPremium }, process.env.TOKEN_SECRET); // Use environment variable for secret
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (isPasswordCorrect) {
            const token = exports.generateAccessToken(user._id, user.name, user.isPremium);
            return res.status(200).json({
                message: 'User login successful',
                token: token,
            });
        } else {
            return res.status(401).json({ message: 'User not authorized' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error getting user by ID:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const updateData = req.body;

        // If updating the password, hash it
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }); // Validate updates

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(204).json(); // 204 No Content for successful deletion
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Edit User functionality
exports.editUser = async (req, res) => {
    try {
      const userId = req.params.userId;
      const { name, email, password } = req.body;
  
      const user = await User.findById(userId); // Use findById for Mongoose
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (req.user.id !== user._id.toString()) { // Compare IDs (convert to string)
        return res.status(403).json({ message: 'You can only edit your own profile' });
      }
  
      if (name) user.name = name;
      if (email) user.email = email;
  
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
      }
  
      await user.save(); // Use save() for Mongoose
  
      res.status(200).json({ message: 'User updated successfully', user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  exports.deleteUser = async (req, res) => {
    try {
      const userId = req.params.userId;
  
      const user = await User.findById(userId); // Use findById
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (req.user.id !== user._id.toString()) { // Compare IDs (convert to string)
        return res.status(403).json({ message: 'You can only delete your own profile' });
      }
  
      // Mongoose uses deleteMany for multiple deletions
      await Expenses.deleteMany({ userId: userId });
      await Orders.deleteMany({ userId: userId });
      await ContentLoaded.deleteMany({ userId: userId });
      await ForgotPassword.deleteMany({ userId: userId });
  
      await user.deleteOne(); // Use remove() for Mongoose
  
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  exports.fetchUserProfile = async (req, res) => {
    try {
      const userId = req.params.userId;
  
      const user = await User.findById(userId); // Use findById
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const userProfile = {
        id: user._id,
        name: user.name,
        email: user.email,
        // password: user.password  // Don't send the password!
      };
  
      res.status(200).json(userProfile);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };