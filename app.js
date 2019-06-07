"use express"

//required modules
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mustacheExpress = require('mustache-express');
const middleware = require('./middleware.js');

//routes
const index = require('./routes/index');
const upload = require('./routes/upload');
const image = require('./routes/image');
const search = require('./routes/search');
const login = require('./routes/login');
const signup = require('./routes/signup');
const logout = require('./routes/logout');
const user = require('./routes/user');

//create the app
const app = express();

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
