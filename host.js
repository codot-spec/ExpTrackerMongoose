const express = require('express');
const app = express();
const dotenv = require('dotenv');

dotenv.config();

const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const cors = require('cors');

const mongoose = require('mongoose');
const User = require('./models/users');
const Expense = require('./models/expenses');
const Order = require('./models/orders')
const Forgotpassword = require('./models/forgotpassword');
const DownloadedContent = require('./models/contentloaded');


const userRoutes = require('./routes/user');  // Importing user routes
const expenseRoutes = require('./routes/expenses');
const purchaseRoutes = require('./routes/purchase');
const premiumFeatureRoutes = require('./routes/premiumFeature')
const resetPasswordRoutes = require('./routes/resetpassword')



const accessLogStream = fs.createWriteStream(
  path.join(__dirname,'access.log'),
  { flags: 'a'});


app.use(cors());  // Allows cross-origin requests


app.use(morgan('combined',{stream: accessLogStream}));
app.use(express.json());

// Route to serve login.html from the 'login' folder
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login','login.html'));  // Serve 'login.html' from 'public/login' folder
});

 // Serve static files for other routes
app.use(express.static(path.join(__dirname, 'public')));



app.use('/user', userRoutes);  // Use /user routes for user operations
app.use('/expenses',expenseRoutes);
app.use('/purchase',purchaseRoutes);
app.use('/premium', premiumFeatureRoutes)
app.use('/password', resetPasswordRoutes);


mongoose.connect('mongodb+srv://codotspec:databasekapass@cluster0.rzco7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(result => {
  app.listen(3000);
})
.catch(err => {
  console.log(err);
});