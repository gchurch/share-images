"use strict";

const express = require("express");
const router = express.Router();
const fs = require("fs");
const mustache = require("mustache");
const database = require("./../database/database.js");
const mw = require("./../middleware.js");

const usernameMaxLength = 20;
const passwordMaxLength = 20;

//load the signup page
function loadSignupTemplate(req, res, next) {
  fs.readFile("views/signup.mustache", "utf8", done);

  //callback function
  function done(err, content) {
    if(err) throw(err);
    res.pageContent = content;
    next();
  }
}

//load the signup success page
function loadSignupSuccessTemplate(req, res, next) {
  fs.readFile("views/signup-success.mustache", "utf8", done);

  //callback function
  function done(err, content) {
    if(err) throw(err);
    res.pageContent = content;
    next();
  }
}

//load the signup failed page
function loadSignupFailTemplate(req, res, next) {
  fs.readFile("views/signup-fail.mustache", "utf8", done);

  //callback function
  function done(err, content) {
    if(err) throw(err);
    res.pageContent = content;
    next();
  }
}

//render the login page template
function renderSignupTemplate(req, res, next) {
  var view = {
    usernameMaxLength: usernameMaxLength,
    passwordMaxLength: passwordMaxLength
  }
  res.pageContent = mustache.render(res.pageContent, view);
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

function usernameTest(username) {
  return /^[a-z0-9]+$/i.test(username);
}

//create the account
function createAccount(req, res, next) {
  //if the username and password are not empty strings
  if(!req.usernameAlreadyExists && req.body.username.length > 0 && req.body.username.length <= usernameMaxLength && 
     usernameTest(req.body.username) && req.body.password.length > 0 && req.body.password.length <= passwordMaxLength)
  {
    database.createAccount(req.body.username, req.body.password, done);
    
    //callback function
    function done() {
      console.log(req.body.username + " signed up.");
      res.signup = true;
      next();
    }
  } 
  else {
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
