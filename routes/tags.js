var express = require('express');
var router = express.Router();
var verifyToken = require('./fnc/verifyIdToken');
const Tags = require('../models/tags.model.js');

router.get('/', function(req, res, next) {
  Tags.find()
      .then(data => {
        res.send({data: data});
      }).catch(err => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving tags."
        });
      });
});

router.post('/add', function(req, res, next) {
  if(!req.body.name) {
    return res.status(400).send({
      msg: "Missing tags name!!"
    });
  }

  const tag = new Tags({
    name: req.body.name
  });

  var idToken = req.headers['authorization'] || '';

  if(verifyToken(idToken)) {
      tag.save()
         .then(data => {
           res.send(data)
         }).catch(err => {
           res.status(500).send({
              msg: err.msg || "Some error occurred while creating tag."
           });
         });
  } else {
    res.status(400).send({
      error: "Access denied!!"
    });
  }
});

router.delete('/remove/:_id', function(req, res, next) {
  if(!req.params._id) {
    return res.status(400).send({
      msg: "Need id tag to delete!!"
    });
  }

  var idToken = req.headers['authorization'] || '';
  if(verifyToken(idToken)) {
    Tags.deleteOne({_id: req.params._id})
         .then(data => {
           if(data) {
             res.send({msg: "Deleted successfully!!"})
           }
         })
         .catch(err => {
           res.status(500).send({
             msg: err.message || "Some error occurred while delete tag."
           });
         });
  } else {
    res.status(400).send({
      error: "Access denied!!"
    });
  }

});

module.exports = router;
