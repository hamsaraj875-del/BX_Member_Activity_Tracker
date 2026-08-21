const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const memberRoutes = require('./routes/memberRoutes');

const app = express();

// MIDDLEWARE - MUST BE ON TOP
app.use(cors()); 
app.use(express.json());

// DB CONNECT
mongoose.connect('mongodb://localhost:27017/bxclub')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// ROUTES
app.use('/api/members', memberRoutes);

// SERVER
app.listen(5000, () => console.log('Server running on 5000'));