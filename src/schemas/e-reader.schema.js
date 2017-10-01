const mongoose = require('mongoose');

var EReaderSchema = new mongoose.Schema({
  model: {
    type: String,
    required: true
  },
  serialNumber: String,
  purchasingDate: Date
});

module.exports = { EReaderSchema };