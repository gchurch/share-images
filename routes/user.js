"use strict";

var express = require("express");
var router = express.Router();
var fs = require("fs");
var database = require("./../database.js");
var mustache = require("mustache");
var mw = require("./../middleware.js");

function loadPageTemplate(req, res, next) {
  fs.readFile("views/user.mustache", "utf8", done);

  //callback function
  function done(err, content) {
  	if(err) throw err;
  	res.pageContent = content;
  	next();
  }
}

function getUserData(req, res, next) {
  database.getUserData(req.params.username, done);

  //callback function
  function done(results) {
    res.userData = results;
    next();
  }
}

function renderPageTemplate(req, res, next) {
  var view = {
  	username: req.params.username,
  	signupDate: res.userData.signupDate
  }
  res.pageContent = mustache.render(res.pageContent, view);
  next();
}

var stylesheets = [];
var scripts = [];
router.get("/:username", loadPageTemplate, getUserData, renderPageTemplate, mw.renderPage(stylesheets,scripts));

module.exports = router;
