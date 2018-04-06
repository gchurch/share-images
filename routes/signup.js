"use strict";

var express = require('express');
var router = express.Router();
var fs = require("fs");
var mustache = require("mustache");
var database = require("./../database.js");
var mw = require("./../middleware.js");

//load the signup page
function loadSignupTemplate(req, res, next) {
  fs.readFile("views/signup.mustache", "utf8", done);

  //callback function
  function done(err, content) {
    if(err) console.log(err);
    res.pageContent = content;
    next();
  }
}

//load the signup success page
function loadSignupSuccessTemplate(req, res, next) {
  fs.readFile("views/signup-success.mustache", "utf8", done);

  //callback function
  function done(err, content) {
    if(err) console.log(err);
    res.pageContent = content;
    next();
  }
}

//load the signup failed page
function loadSignupFailTemplate(req, res, next) {
  fs.readFile("views/signup-fail.mustache", "utf8", done);

  //callback function
  function done(err, content) {
    if(err) console.log(err);
    res.pageContent = content;
    next();
  }
}

//render the login page template
function renderSignupTemplate(req, res, next) {
  res.pageContent = mustache.render(res.pageContent, {results: res.result});
  next();
}

// GET requests for signup
var stylesheets = [];
var scripts = [];
router.get('/', loadSignupTemplate, renderSignupTemplate, mw.renderPage(stylesheets, scripts));
router.get('/fail', loadSignupFailTemplate, renderSignupTemplate, mw.renderPage(stylesheets, scripts));
router.get('/success', loadSignupSuccessTemplate, renderSignupTemplate, mw.renderPage(stylesheets, scripts));

//check if the provided username is already used by an account
function checkUsernameAlreadyExists(req, res, next) {
  database.checkUsernameAlreadyExists(req.body.username, done);

  //callback function
  function done(result) {
    req.usernameAlreadyExists = result;
    next();
  };
}

//create the account
function createAccount(req, res, next) {
  //if the username and password are not empty strings
  if(!req.usernameAlreadyExists && req.body.username != '' && req.body.password != '') {
    database.createAccount(req.body.username, req.body.password, done);
    
    //callback function
    function done() {
      console.log("Account with username '" + req.body.username + "' has been created.");
      res.signup = true;
      next();
    }
  } 
  else {
  	console.log("Signup failed.");
    res.signup = false;
  	next();
  }
}

//redirect request to the appropriate page
function redirect(req, res, next) {
  if(res.signup) {
    res.redirect('/signup/success');
  }
  else {
    res.redirect('/signup/fail');
  }
}

//POST request to signup to website
router.post('/', checkUsernameAlreadyExists, createAccount, redirect);

module.exports = router;
