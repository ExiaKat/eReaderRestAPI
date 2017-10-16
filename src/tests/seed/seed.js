const { MemberInfo } = require('./../../models/member-info.model');
const { User } = require('./../../models/user.model');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

var memberInfos = [{
  _id: new ObjectId(),
  memberNumber: "111111",
  parentName: "Harry Xia",
  mobile: "15962651243",
  children: [{
    childName: "Kath",
    dob: "2012-05-03",
    gender: "female"
  }],
  eReader: {model: "S800", serialNumber: "111111", purchasingDate: "2015-11-06"},
  deposit: 100,
  expiryDate: "2018-01-01",
  rentalBooks: [
    {bookName: "三国演义", quantity: 1, borrowDate: "2017-09-28", returnDate: "2017-10-16"},
    {bookName: "水浒传", quantity: 1, borrowDate: "2017-09-28", returnDate: null},
    {bookName: "西游记", quantity: 1, borrowDate: "2017-09-28", returnDate: null}
  ]
}, {
  _id: new ObjectId(),
  memberNumber: "222222",
  parentName: "Liu Bo",
  mobile: "13965645822",
  children: [{
    childName: "Liu Yujia",
    dob: "2012-05-27",
    gender: "female"
  }],
  eReader: {model: "S800", serialNumber: "222222", purchasingDate: "2015-12-06"},
  deposit: 100,
  expiryDate: "2018-01-01",
  rentalBooks: [
    {bookName: "小王子", quantity: 1, borrowDate: "0217-05-16", returnDate: null},
    {bookName: "红楼梦", quantity: 1, borrowDate: "2017-06-15", returnDate: null}
  ]
}];

var user1_id = new ObjectId();
var user2_id = new ObjectId();
var users = [{
  _id : user1_id,
  email: "user1@test.com",
  password: "password01",
  tokens: [{
    access: "auth",
    token: jwt.sign({_id: user1_id.toHexString(), access: "auth"}, "mysecret")
  }]
}, {
  _id: user2_id,
  email: "user2@test.com",
  password: "password02"
}];

var insertMembers = (done) => {
  MemberInfo.remove({}).then(() => {
    return MemberInfo.insertMany(memberInfos)            
  }).then(() => done());
};

var insertUsers = (done) => {
  User.remove({}).then(() => {
    user1 = new User(users[0]).save();
    user2 = new User(users[1]).save();
    return Promise.all([user1, user2])
  }).then(() => done());
}

module.exports = { memberInfos, users, insertMembers, insertUsers };