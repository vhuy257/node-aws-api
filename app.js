var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var topicRouter    = require('./routes/topic');
var commentsRouter = require('./routes/comments');
var apiRouter      = require('./routes/api');
var tagRouter      = require('./routes/tags');
var hike = require('./routes/hike');

var cors       = require('cors');
var app = express();

const mongoose = require('mongoose');

mongoose.connect('mongodb://vhuy2571990:langtu1990!@ds133187.mlab.com:33187/heroku_l7tf6059', {useNewUrlParser: true})
  .then(() => {
    console.log('connect to db successfully');
  })
  .catch(err => {
    console.log('Could not connect to database', err);
    process.exit();
  })

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get('/hikes', hike.index);
app.post('/add_hike', hike.add_hike);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
//app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/topics', topicRouter);
app.use('/api/tags', tagRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
