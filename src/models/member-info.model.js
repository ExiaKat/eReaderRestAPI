const mongoose = require('mongoose');

const { MemberSchema } = require('../schemas/member-info.schema');

var MemberInfo = mongoose.model('MemberInfo', MemberSchema);

module.exports = { MemberInfo };