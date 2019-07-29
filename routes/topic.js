var express = require('express');
var router = express.Router();
var verifyToken = require('./fnc/verifyIdToken');
var url_slug = require('./fnc/convertStringToSlug');

const Topic = require('../models/topic.model.js');

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next();
})

/* GET topic index page. */
router.get('/listopic/:pageSize', function(req, res, next) {
  Topic.find().sort({_id: -1})
       .then(data => {
         var _total = data.length;
         var _pageSize = req.params.pageSize;

         if(_total <= _pageSize) {
           res.send({data: data});
         } else {
           var pagesTotal = Math.ceil(_total/_pageSize);
           Topic.find().sort({_id: -1}).limit(parseInt(req.params.pageSize))
            .then(data => {
              res.send({data: data, pages: pagesTotal});
            }).catch(err => {
              res.status(500).send({
                message: err.message || "Some error occurred while retrieving notes."
              });
            })
         }
       }).catch(err => {
         res.status(500).send({
           message: err.message || "Some error occurred while retrieving notes."
         });
       });
});

/* GET topic page with pageNumber*/
router.get('/listopic/:pageSize/:pageLength/:pageNumber', function(req, res) {
  Topic.find().skip(req.params.pageSize * (req.params.pageNumber - 1)).limit(parseInt(req.params.pageSize)).sort({_id: -1})
  .then(data => {
    res.send({data: data, pages: req.params.pageLength});
  }).catch(err => {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving topics."
    });
  })
});

/* GET topic with id */
router.get('/id/:_id', function(req, res, next) {
  Topic.find({_id: req.params._id})
       .then(data => {
         res.send(data);
       }).catch(err => {
         res.status(500).send({
           message: err.message || "Some error occurred while retrieving notes."
         });
       })
});

/* ADD topic */
router.post('/add', function(req, res, next) {
  if(!req.body.content) {
    return res.status(400).send({
      msg: "Topic content can not be empty!!"
    });
  }

  const topic = new Topic({
     user: req.body.user || "Anonymous",
     title: req.body.title,
     image: req.body.imageUrl,
     slug:  url_slug(req.body.title),
     excerpt: req.body.excerpt,
     content: req.body.content,
     tags: req.body.tags
  });

  var idToken = req.headers['authorization'] || '';
  if(verifyToken(idToken)) {
    topic.save()
      .then(data => {
        res.send(data);
      }).catch(err => {
        res.status(500).send({
          message: err.message || "Some error occurred while creating comment."
        });
      });
  } else {
    res.status(400).send({
      error: "Access denied!!"
    });
  }
});

/* REMOVE topic */
router.delete('/remove/:_id', function(req, res, next) {
  if(!req.params._id) {
    return res.status(400).send({
      msg: "Need id topic to delete!!"
    });
  }

  var idToken = req.headers['authorization'] || '';

  if(verifyToken(idToken)) {
    Topic.deleteOne({_id: req.params._id})
         .then(data => {
           if(data) {
             res.send({msg: "Deleted successfully!!"})
           }
         })
         .catch(err => {
           res.status(500).send({
             msg: err.message || "Some error occurred while delete topic."
           });
         });
  } else {
    res.status(400).send({
      error: "Access denied!!"
    });
  }
});

/* UPDATE topic */
router.put('/update', function(req, res, next) {
  if(!req.body._id) {
    return res.status(400).send({
      msg: "Need id topic to update!!"
    });
  }

  var idToken = req.headers['authorization'] || '';
  if(verifyToken(idToken)) {
    Topic.updateOne(
      {_id: req.body._id},
      {
        $set:
        {
          content: req.body.contentTopic,
          title: req.body.titleTopic,
          image: req.body.imageUrl,
          slug: url_slug(req.body.titleTopic),
          user: req.body.user,
          excerpt: req.body.excerptTopic,
          tags: req.body.tags
        }
      }
    ).then(data => {
      res.send({success: true, msg: 'Updated topic id ' + req.body._id + ' successfully!!'});
    }).catch(err => {
      res.status(400).send(err);
    });
  } else {
    res.status(400).send({
      error: "Access denied!!"
    });
  }

});

/*SEARCH topic */
router.post('/search', function(req, res, next) {
  if(req.body.text == "") {
    return Topic.find().sort({_id: -1})
         .then(data => {
           var _total = data.length;
           var _pageSize = req.body.pageSize;
           var pagesTotal = Math.ceil(_total/_pageSize);

           res.send({data: data, pages: pagesTotal});
         }).catch(err => {
           res.status(500).send({
             message: err.message || "Some error occurred while retrieving notes."
           });
         });
  }
  return Topic.find({
    $text: { $search: req.body.text}
  }).then(data => {
    var _total = data.length;
    var _pageSize = req.body.pageSize;

    if(_total <= _pageSize) {
      res.send({data: data});
    } else {
      var pagesTotal = Math.ceil(_total/_pageSize);
      Topic.find({
        $text: { $search: req.body.text}
      }).sort({_id: -1}).limit(parseInt(req.params.pageSize))
       .then(data => {
         res.send({data: data, pages: pagesTotal});
       }).catch(err => {
         res.status(500).send({
           message: err.message || "Some error occurred while retrieving notes."
         });
       });
    }
  }).catch(err => {
    res.status(400).send(err);
  });
});

/*Filter topic by tags*/
router.get('/tag/:_tagname', function(req, res, next) {
  Topic.find({
    tags: { $elemMatch: {name: req.params._tagname}}
  }).then(data => {
    res.send({data: data});
  }).catch(err => {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving notes."
    });
  })
});

module.exports = router;
