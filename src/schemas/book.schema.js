const mongoose = require('mongoose');

var BookSchema = new mongoose.Schema({
  bookName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  borrowDate: {
    type: Date,
    required: true
  },
  returnDate: Date
});

module.exports = { BookSchema };