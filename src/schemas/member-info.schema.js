const mongoose = require('mongoose');

const { ChildSchema } = require('./child.schema');
const { BookSchema }  = require('./book.schema');
const { EReaderSchema } = require('./e-reader.schema');

var MemberSchema = new mongoose.Schema({
  memberNumber: String,
  parentName: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true
  },
  children: [ChildSchema],
  eReader: EReaderSchema,
  deposit: Number,
  expiryDate: Date,
  rentalBooks: [BookSchema]
});

module.exports = { MemberSchema };