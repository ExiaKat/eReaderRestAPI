const { Schema } = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate: {
      isAsync: true,
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();
  return _.pick(userObject, ['_id', 'email']);  
};

UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = "auth"
  var token = jwt.sign({_id: user._id.toHexString(), access}, "mysecret");
  
  user.tokens.push({access, token});

  return user.save().then(() => {
    return token;
  });
};

UserSchema.statics.findByCredentials = function (email, password) {
  var User = this;
  return User.findOne({email}).then(usr => {
    if (!usr) {
      return Promise.reject();
    }
    return bcrypt.compare(password, usr.password).then(res => {
      if (res)
        return Promise.resolve(usr);
      return Promise.reject();
    });
  });
};

UserSchema.statics.findUserByToken = function (token) {
  var User = this;
  var verifiedUser;
  try {
    verifiedUser = jwt.verify(token, "mysecret");
  } catch (error) {
    return Promise.reject("invalid token");
  }  

  return User.findOne({
    _id: verifiedUser._id,
    "tokens.access": verifiedUser.access,
    "tokens.token": token
  });
};

UserSchema.pre('save', function (next) {
  var user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10).then(salt => {
      bcrypt.hash(user.password, salt).then(hash => {
        user.password = hash;
        next();
      });
    });
  }
  else {
    next();
  }
});

module.exports = { UserSchema };