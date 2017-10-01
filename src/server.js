const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');
const cors = require('cors');

const { mongoose } = require('./mongodb/mongoose');
const { MemberInfo } = require('./models/member-info.model');

var port = process.env.PORT || 3000;
var app = express();

app.use(express.static('public'));
//use cors middleware to enable cross-domain access
// app.use(cors());


//or use custom function to set response header to allow cross-domain access
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
     .header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(bodyParser.json());

app.post('/api/member', (req, res) => {
  var memberInfo = new MemberInfo(req.body);
  memberInfo.save().then((member) => {
    res.send(member);
  })
  .catch((err) => {
    res.status(400).send(err);
  });
});

app.get('/api/member/', (req, res) => {
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

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
})