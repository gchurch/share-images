"use express"

//required modules
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mustacheExpress = require('mustache-express');
var middleware = require('./middleware.js');

//connect to the database
require("./database/database.js").connectToDatabase();

//routes
var index = require('./routes/index');
var upload = require('./routes/upload');
var image = require('./routes/image');
var search = require('./routes/search');
var login = require('./routes/login');
var signup = require('./routes/signup');
var logout = require('./routes/logout');
var user = require('./routes/user');

//create the app
var app = express();

//using the mustache template engine
app.engine('mustache', mustacheExpress());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache');

//disabled the view caching, makes development easier
app.disable('view cache');
//disabled caching of pages so changes to headers can be seen
app.disable('etag');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(middleware.getSessionUsername);

app.use('/', index);
app.use('/upload', upload);
app.use('/image', image);
app.use('/search', search);
app.use('/login', login);
app.use('/signup', signup);
app.use('/logout', logout);
app.use('/user', user);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('layout', {content: "<p>Page does not exist.</p>"});
});

module.exports = app;
