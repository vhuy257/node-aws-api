var express = require('express');
var router = express.Router();
var verifyToken = require('./fnc/verifyIdToken.js');

const Comment = require('../models/comments.model.js');

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
    console.log('Time: ', Date.now())
    next()
})

router.get('/', function(req, res) {
    createToken = createCustomToken();
    createToken.then(token => {
      tokenApi = token;
      res.send(tokenApi);
    }).catch(err => { console.error('Cant create token!!'); })
});

/* Api add comment */
router.post('/add', function(req, res) {
  var idToken = req.headers['authorization'] || '';
  if(verifyToken(idToken)) {
    if(!req.body.content) {
      return res.status(400).send({
        message: "Comment can not be empty!!"
      });
    }
    const comment = new Comment({
       date: req.body.date,
       user: req.body.user || "Anonymous",
       content: req.body.content,
       topicId: req.body.topicid,
       userPhoto: req.body.photoURL
    });
    comment.save()
      .then(data => {
        res.send(data);
      }).catch(err => {
        res.status(500).send({
          message: err.message || "Some error occurred while creating comment."
        });
      });
  } else {
     res.status(400).send("Not Authorization!!");
  }
});

/* Api find all comments by id */
router.get('/:topicId/:pageNumber', function(req, res){
    Comment.find({topicId: req.params.topicId})
    .then(comments => {
      var pageTotal = comments.length;
      if(pageTotal > process.env.PAGE_SIZE_LIMIT_COMMENT) {
        Comment.find({topicId: req.params.topicId}).skip(process.env.PAGE_SIZE_LIMIT_COMMENT * (req.params.pageNumber - 1)).limit(process.env.PAGE_SIZE_LIMIT_COMMENT).sort({_id: -1})
        .then(comments => {
          if(comments.length >= process.env.PAGE_SIZE_LIMIT_COMMENT) {
            res.send({data: comments, paging: true});
          } else {
            res.send({data: comments, paging: false});
          }
        }).catch(err => {
          res.status(500).send({
            message: err.message || "Some error occurred while retrieving comment."
          });
        });
      } else {
        res.send({data: comments});
      }
    }).catch(err => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving comment."
        });
    });
});

module.exports = router;
