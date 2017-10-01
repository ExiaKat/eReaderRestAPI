const mongoose = require('mongoose');

var ChildSchema = new mongoose.Schema({
  childName: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true
  }
});

module.exports = { ChildSchema };