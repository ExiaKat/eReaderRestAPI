const expect = require('expect');
const request = require('supertest');

const { app } = require('./../server');
const { MemberInfo } = require('./../models/member-info.model');
const { User } = require('./../models/user.model');
const { memberInfos, users, insertMembers, insertUsers } = require('./seed/seed');

beforeEach(insertUsers);
beforeEach(insertMembers);
var token = users[0].tokens[0].token;

describe('POST /api/users', () => {

  it('should return an x-auth header containing jwt token', (done) => {
    var user = {
      email: "test@example.com",
      password: "abc123!"
    };
    request(app)
      .post('/api/users')
      .send(user)
      .expect(200)
      .expect((res) => {
        expect(res.headers["x-auth"]).toBeTruthy();
      })
      .end((err, res) => {
        if (err)
          return done(err);
        User.findOne({email: user.email}).then(usr => {
          expect(usr).toBeTruthy();
          done();
        }).catch(err => done(err));
      });
  });

  it('should get status 400 if email is duplicated', (done) => {
    var user = {
      email: "user1@test.com",
      password: "abc12345"
    };
    request(app)
      .post('/api/users')
      .send(user)
      .expect(400)
      .expect((res) => {
        expect(res.headers["x-auth"]).toBeFalsy();
      })
      .end((err, res) => {
        if (err) return done(err);
        User.find({}).then(usrs => {
          expect(usrs.length).toBe(2);
          done();
        }).catch(done);
      })    
  });

  it('should get status 400 if email is not a valid email', (done) => {
    var user = {
      email: "jackemail",
      password: "abc12323"
    };

    request(app)
      .post('/api/users')
      .send(user)
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeFalsy()
      })
      .end((err, res) => {
        if (err) return done(err);
        User.find({}).then(usrs => {
          expect(usrs.length).toBe(2);
          done()
        }).catch(done);
      });
  });

  it('should get status 400 if password length is less than 6', done => {
    var user = {
      email: "jack@example.com",
      password: "123"
    };

    request(app)
      .post('/api/users')
      .send(user)
      .expect(400)
      .expect(res => {
        expect(res.header['x-auth']).toBeFalsy();
      })
      .end((err, res) => {
        if (err) return done(err);
        User.find({}).then(usrs => {
          expect(usrs.length).toBe(2);
          done()
        }).catch(done);
      });
  });

});

describe('POST /api/users/login', () => {

  it('should get x-auth token in response header', done => {
    request(app)
      .post('/api/users/login')
      .send(users[1])
      .expect(200)
      .expect(res => {
        expect(res.headers["x-auth"]).toBeTruthy();
      })
      .end((err, res) => {
        if (err) return done(err);
        User.findById(users[1]._id).then(usr => {
          expect(usr.toObject().tokens[0]).toMatchObject({
            token: res.headers['x-auth'],
            access: 'auth'
          });
          done()
        }).catch(done);
      });
  });

  it('should not get x-auth token if login with wrong password', done => {
    var user = {
      email: "user2@test.com",
      password: "123456"
    };

    request(app)
      .post('/api/users/login')
      .send(user)
      .expect(401)
      .expect(res => {
        expect(res.headers["x-auth"]).toBeFalsy();
      })
      .end((err, res) => {
        if (err) return done(err);

        User.findOne({email: user.email}).then(usr => {
          expect(usr.tokens.length).toBe(0);
          done();
        }).catch(done);
      });
  });

});

describe('GET /api/users/me', () => {
  it('should get valid user if authenticated', done => {
    request(app)
      .get('/api/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
      })
      .end(done);
  });

  it('should not get user if not authenticated', done => {
    request(app)
      .get('/api/users/me')
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });

  it('should note get user if using invalid token', done => {
    request(app)
      .get('/api/users/me')
      .set('x-auth', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OWU0NWU4Zjg4MGQ4MDI1NTAwNzMxM2UiLCJpYXQiOjE1MDgxMzg2Mzl9.oX_kElTlMvyXKhCW8yG98YqfrNwYlRD5zk6FF8BOeDQ')
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done)
  });

});

describe('POST /api/member', () => {

  it('should insert a new member', done => {
    var member = {
      memberNumber: "123456",
      parentName: "贾乃亮",
      mobile: "15914520632",
      children: [{
        childName: "甜馨",
        dob: "2012-06-03",
        gender: "female"
      }],
      eReader: {model: "S800", serialNumber: "123456", purchasingDate: "2015-11-06"},
      deposit: 200,
      expiryDate: "2018-01-01",
      rentalBooks: []
    };

    request(app)
      .post('/api/member')
      .set('x-auth', token)
      .send(member)
      .expect(200)
      .expect(res => {
        expect(res.body.mobile).toBe(member.mobile);
      })
      .end((err, res) => {
        if (err) return done(err);
        MemberInfo.find({mobile: member.mobile}).then(members => {
          expect(members.length).toBe(1);
          expect(members[0].parentName).toBe(member.parentName);
          done();
        }).catch(done);
      });
  });

  it('should not insert a new member if parent name is empty', done => {
    var member = {
      memberNumber: "123456",
      parentName: "",
      mobile: "15914520632",
      children: [{
        childName: "甜馨",
        dob: "2012-06-03",
        gender: "female"
      }],
      eReader: {model: "S800", serialNumber: "123456", purchasingDate: "2015-11-06"},
      deposit: 200,
      expiryDate: "2018-01-01",
      rentalBooks: []
    };

    request(app)
      .post('/api/member')
      .set('x-auth', token)
      .send(member)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        MemberInfo.find({}).then(members => {
          expect(members.length).toBe(2);
          done();
        }).catch(done);
      });
  });

  it('should not insert member if mobile number is duplicated', done => {
    let member = {
      parentName: "贾乃亮",
      mobile: "15962651243",
      children: [{
        childName: "甜馨",
        dob: "2012-06-03",
        gender: "female"
      }],
      eReader: {model: "S800", serialNumber: "123456", purchasingDate: "2015-11-06"},
      deposit: 200,
      expiryDate: "2018-01-01",
      rentalBooks: []
    };

    request(app)
      .post('/api/member')
      .set('x-auth', token)
      .send(member)
      .expect(400)
      .expect(res => {
        MemberInfo.find({}).then(members => {
          expect(members.length).toBe(2);
        });
      })
      .end(done);
  });

});

describe('GET /api/member', () => {
  it('should return all members if request query parameter is empty', done => {
    request(app)
      .get('/api/member')
      .set('x-auth', token)
      .expect(200)
      .expect(res => {
        expect(res.body.members.length).toBe(2);
      })
      .end(done);
  });

  it('should return particular member if request query parameter is supplied', done => {
    request(app)
      .get('/api/member')
      .set('x-auth', token)
      .query({ mobile: "15962651243" })
      .expect(200)
      .expect(res => {
        expect(res.body.members[0].parentName).toBe(memberInfos[0].parentName);
      })
      .end(done);
  });

});

describe('PATCH /api/member/:id', () => {

  it('should update the member by its id', done => {
    var member = {
      mobile: "12345678901"
    };

    request(app)
      .patch('/api/member/' + memberInfos[0]._id)
      .set('x-auth', token)
      .send(member)
      .expect(200)
      .expect(res => {
        expect(res.body.member.mobile).toBe(member.mobile);
      })
      .end((err, res) => {
        if (err) return done(err);
        MemberInfo.findById(memberInfos[0]._id).then(mmb => {
          expect(mmb.mobile).toBe(member.mobile);
          done()
        }).catch(done);
      })
  });

  it('should get status 400 if mobile is duplicated', done => {
    var member = {
      mobile: "13965645822"
    };

    request(app)
      .patch('/api/member/' + memberInfos[0]._id)
      .set('x-auth', token)
      .send(member)
      .expect(400, done);
  });

  // it('should get status 400 if modified parent name is empty', done => {
  //   var member = {
  //     parentName: ""
  //   };

  //   request(app)
  //     .patch('/api/member/' + memberInfos[0]._id)
  //     .set('x-auth', token)
  //     .send(member)
  //     .expect(400, done);
  // });

});

describe('DELETE /api/member/:id', () => {

  it('should delete a member if this member id is provided', done => {
    request(app)
      .delete('/api/member/' + memberInfos[0]._id)
      .set('x-auth', token)
      .expect(200)
      .expect(res => {
        MemberInfo.find({}).then(mmbs => {
          expect(mmbs.length).toBe(1);
        });
      })
      .end(done);
  });

  it('should not delete a member if this member id is invalid', done => {
    request(app)
      .delete('/api/member/123456887')
      .set('x-auth', token)
      .expect(400)
      .expect(res => {
        MemberInfo.find({}).then(mmbs => {
          expect(mmbs.length).toBe(2);
        });
      })
      .end(done);
  });
  
});