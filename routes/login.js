"use strict";

var express = require('express');
var router = express.Router();
var fs = require("fs");
var mustache = require("mustache");
var database = require("./../database.js");
var mw = require("./../middleware.js");

//load the login page template
function loadLoginTemplate(req, res, next) {
  fs.readFile("views/login.mustache", "utf8", done);

  //callback function
  function done(err, content) {
    if(err) console.log(err);
    res.pageContent = content;
    next();
  }
}

//load the login success page template
function loadLoginSuccessTemplate(req, res, next) {
  fs.readFile("views/login-success.mustache", "utf8", done);

  //callback function
  function done(err, content) {
    if(err) console.log(err);
    res.pageContent = content;
    next();
  }
}

//load the login fail page template
function loadLoginFailTemplate(req, res, next) {
  fs.readFile("views/login-fail.mustache", "utf8", done);

  //callback function
  function done(err, content) {
    if(err) console.log(err);
    res.pageContent = content;
    next();
  }
}

//render the login page template
function renderLoginTemplate(req, res, next) {
  res.pageContent = mustache.render(res.pageContent, {results: res.result});
  next();
}

//GET login page
var stylesheets = [];
var scripts = [];
router.get('/', loadLoginTemplate, renderLoginTemplate, mw.renderPage(stylesheets, scripts));
router.get('/fail', loadLoginFailTemplate, renderLoginTemplate, mw.renderPage(stylesheets, scripts));
router.get('/success', loadLoginSuccessTemplate, renderLoginTemplate, mw.renderPage(stylesheets, scripts));


//check that the given login details match an account on the database
function checkLoginDetails(req, res, next) {
  database.checkLoginDetails(req.body.username, req.body.password, done);

  //callback function
  function done(result) {
  	if(result == true) {
      res.login = true;
  		console.log("login details for " + req.body.username + " were correct");
  	}
  	else {
      res.login = false;
  		console.log("login details were incorrect");
  	}
  	next();
  }
}

//create a session if the login details were correct
function createSession(req, res, next) {
  if(res.login == true) {
    database.createSession(req.body.username, done);
    
    //callback function
    function done(cookie) {
      res.cookie("session", cookie);
      console.log("session created for " + req.body.username + ".");
      next();
    }
  }
  else {
    next();
  }
}

//redirect the request to the appropriate page
function redirect(req, res, next) {
  if(res.login) {
    res.redirect('/login/success');
  } else {
    res.redirect('/login/fail');
  }
}

//POST request to login
router.post('/', checkLoginDetails, createSession, redirect);

module.exports = router;