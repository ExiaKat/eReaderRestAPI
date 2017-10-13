const mongoose = require('mongoose');

const { UserSchema } = require('./../schemas/user.schema');

var User = mongoose.model("User", UserSchema);

module.exports = { User };
