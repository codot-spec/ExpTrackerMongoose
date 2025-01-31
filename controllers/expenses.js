const AWS = require('aws-sdk');

const Expense = require('../models/expenses');
const User = require('../models/users')
const DownloadedContent = require('../models/contentloaded');

exports.addExpense = async (req, res) => {
  try {
      const { amount, description, category } = req.body;

      if (!amount || amount <= 0) {
          return res.status(400).json({ success: false, message: 'Invalid or missing amount' });
      }

      const newExpense = new Expense({ amount, description, category, userId: req.user._id });
      await newExpense.save();

      req.user.totalExpenses += amount;
      await req.user.save();

      res.status(201).json(newExpense);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error adding expense', error: error.message });
  }
};



exports.updateExpense = async (req, res) => {
  try {
      const expenseId = req.params.expenseId;
      const { amount, description, category } = req.body;

      const oldExpense = await Expense.findById(expenseId);

      if (!oldExpense) {
          return res.status(404).json({ message: 'Expense not found' });
      }

      const diff = amount - oldExpense.amount;

      await Expense.findByIdAndUpdate(
          expenseId,
          { amount, description, category },
          { new: true, runValidators: true } // Important: new: true to return updated document
      );

      req.user.totalExpenses += diff;
      await req.user.save();

      const updatedExpense = await Expense.findById(expenseId);
      res.status(200).json(updatedExpense);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating expense', error: error.message });
  }
};


exports.deleteExpense = async (req, res) => {
  try {
      const expenseId = req.params.expenseId;

      const expense = await Expense.findById(expenseId);

      if (!expense) {
          return res.status(404).json({ message: 'Expense not found' });
      }

      await Expense.findByIdAndDelete(expenseId);

      req.user.totalExpenses -= expense.amount;
      await req.user.save();

      res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error deleting expense', error: error.message });
  }
};



function uploadToS3(data, filename) {
  const BUCKET_NAME = process.env.BUCKET_NAME;
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

  const s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET
  });

  const params = {
    Bucket: BUCKET_NAME,
    Key: filename,  // Ensure filename is passed correctly
    Body: data,     // Body is the file content
    ACL: 'public-read',
    ContentType: 'image/png'  // You can set the content type according to your file
  };

  return new Promise((resolve, reject) => {
    s3bucket.upload(params, (err, s3response) => {
      if (err) {
        console.log("Something went wrong", err);
        reject(err);
      } else {
        resolve(s3response.Location);  // Return the S3 URL
      }
    });
  });
}



exports.downloadExpense = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id });
    const stringifiedExpenses = JSON.stringify(expenses);
    const userId = req.user._id;
    const filename = `Expense${userId}/${new Date()}.txt`;
    const fileUrl = await uploadToS3(stringifiedExpenses, filename);

    const downloadedContent = new DownloadedContent({ userId, url: fileUrl, filename });
    await downloadedContent.save();

    res.status(200).json({ fileUrl, success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ fileUrl: '', success: false, err: err.message });
  }
};

exports.getDownloadedContent = async (req, res) => {
  try {
    const downloadedContents = await DownloadedContent.find({ userId: req.user._id });
    res.status(200).json(downloadedContents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching downloaded content', error: err.message });
  }
};

exports.getExpenses = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 2;

        const skip = (page - 1) * limit;

        const expenses = await Expense.find({ userId: req.user._id })
            .skip(skip)
            .limit(limit);

        const count = await Expense.countDocuments({ userId: req.user._id });
        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            expenses,
            pagination: {
                totalItems: count,
                totalPages,
                currentPage: page,
                itemsPerPage: limit,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching expenses', error: error.message });
    }
};

exports.getExpensesByDateRange = async (req, res) => {
    try {
        const { range, page = 1, limit = 2 } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        let dateCondition;
        const today = new Date();

        if (range === 'daily') {
            dateCondition = {
                createdAt: {
                    $gte: new Date(today.setHours(0, 0, 0, 0)),
                    $lte: new Date(today.setHours(23, 59, 59, 999)),
                },
            };
        } else if (range === 'weekly') {
            const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
            dateCondition = {
                createdAt: {
                    $gte: weekStart,
                    $lte: new Date(),
                },
            };
        } else if (range === 'monthly') {
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            dateCondition = {
                createdAt: {
                    $gte: monthStart,
                    $lte: new Date(),
                },
            };
        } else {
            return res.status(400).json({ message: 'Invalid date range' });
        }

        const skip = (pageNumber - 1) * limitNumber;

        const expenses = await Expense.find({ userId: req.user._id, ...dateCondition })
            .skip(skip)
            .limit(limitNumber);

        const count = await Expense.countDocuments({ userId: req.user._id, ...dateCondition });
        const totalPages = Math.ceil(count / limitNumber);

        res.status(200).json({
            expenses,
            pagination: {
                totalItems: count,
                totalPages,
                currentPage: pageNumber,
                itemsPerPage: limitNumber,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching expenses', error: error.message });
    }
};

