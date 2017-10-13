const { User } = require('./../models/user.model');

var authenticate = (req, res, next) => {
  var token = req.header("x-auth");
  User.findUserByToken(token).then((user) => {
    if (!user)
      return Promise.reject("User not found");
    req.user = user;
    req.token = token;
    console.log(req);
    next();
  }).catch((err) => {
    res.status(401).send(err);
  });  
};

module.exports = { authenticate };