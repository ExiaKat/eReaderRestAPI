const mongoose = require('mongoose');
const assert = require('assert');

const { MemberInfo } = require('./member-info.model');


describe('MemberInfo Model', () => {

  it('should insert correct member', (done) => {
    var memberInfo = new MemberInfo(
    {
      memberNumber: "333333",
      parentName: "夏黉峰",
      mobile: "15962606201",
      children: [{
        childName: "夏雪兰",
        dob: "03/05/2012",
        gender: "female"
      }],
      eReader: {model: "S800", serialNumber: "123456", purchasingDate: "11/06/2015"},
      deposit: 100,
      expiryDate: "01/01/2018",
      rentalBooks: [
        {bookName: "三国演义", quantity: 1, borrowDate: "09/28/2017", returnDate: null},
        {bookName: "水浒传", quantity: 1, borrowDate: "09/28/2017", returnDate: null},
        {bookName: "西游记", quantity: 1, borrowDate: "09/28/2017", returnDate: null}
      ]
    });
    memberInfo.save().then((record) => {
      assert(record.parentName === '夏黉峰');
      done();
    })
  })
});