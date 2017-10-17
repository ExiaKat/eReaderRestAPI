var env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/eReaderDB';
} else if (env === 'test') {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/eReaderDBTest';
}

const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const { mongoose } = require('./mongodb/mongoose');
const { MemberInfo } = require('./models/member-info.model');
const { User } = require('./models/user.model');
const { authenticate } = require('./middleware/authenticate');

var port = process.env.PORT;
var app = express();

var staticFolderPath = path.join(__dirname, "../public");
app.use(express.static(staticFolderPath));

//uncomment following code to use cors middleware to enable cross-domain access
// app.use(cors());

//or use custom function to set response header to allow cross-domain access
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
     .header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

//to enable pre-flight across board using cors middleware
app.options('*', cors());

//parse request body to json
app.use(bodyParser.json());

//POST /api/users
app.post('/api/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);
  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token)=> {
    res.header("x-auth", token).send(user);
  }).catch((err) => {
    res.status(400).send(err.message);
  });
});

//POST /api/users/login
app.post('/api/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  User.findByCredentials(body.email, body.password).then(user => {
    return user.generateAuthToken().then(token => {
      res.header("x-auth", token).send(user);
    });
  }).catch(err => {
    res.status(401).send("Invalid email or password");
  });
});

//DELETE /api/users/logout
app.delete('/api/users/logout', authenticate, (req, res) => {
  var _id = req.user._id;
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }).catch(err => {
    res.status(400).send(err);
  });
});

//GET /api/users/me
app.get('/api/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

//POST /api/member
app.post('/api/member', (req, res) => {
  var memberInfo = new MemberInfo(req.body);
  memberInfo.save().then((member) => {
    res.send(member);
  })
  .catch((err) => {
    res.status(400).send(err);
  });
});

//GET /api/member
app.get('/api/member', authenticate, (req, res) => {
  if(_.isEmpty(req.query)) {
    MemberInfo.find({}).then(members => {
      res.send({ members });
    })
    .catch(err => res.status(400).send(err));
  }
  else { 
    const { parentName, mobile, serialNumber } = req.query;
    let query = {};
    if (!_.isEmpty(parentName)) {
      query = { parentName };
    }
    else if (!_.isEmpty(mobile)) {
      query = { mobile };
    }
    else if (!_.isEmpty(serialNumber)) {
      query = { "eReader.serialNumber": serialNumber };
    }
    
    MemberInfo.find(query).then( members => {
      res.send({ members });
    })
    .catch(err => res.status(400).send(err));
  }
});

//PATCH /api/member/:id
app.patch('/api/member/:id', (req, res) => {
  let id = req.params.id;
  MemberInfo.findByIdAndUpdate(id, {$set: req.body}, {new: true}).then((member) => {
    if (!member) {
      return res.status(404).send("member is not found!");
    }
    res.send({ member });
  })
  .catch(err => res.status(400).send(err));
});

//DELETE /api/member/:id
app.delete('/api/member/:id', (req, res) => {
  let id = req.params.id;
  MemberInfo.findByIdAndRemove(id).then(member => {
    if (!member) {
      return res.status(404).send("member is not found!");
    }
    res.status(200).send({ member });
  })
  .catch(err => res.status(400).send(err));
});

//Start server on corresponding port
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
})

module.exports = { app };