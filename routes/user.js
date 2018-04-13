"use strict";

const express = require("express");
const router = express.Router();
const fs = require("fs");
const database = require("./../database/database.js");
const mustache = require("mustache");
const mw = require("./../middleware.js");

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

function getUserImages(req, res, next) {
  database.getUserImages(req.params.username, done);

  //callback functioin
  function done(results) {
    res.userImages = results;
    next();
  }
}

function getUserComments(req, res, next) {
  database.getUserComments(req.params.username, done);

  //callback function
  function done(results) {
    res.userComments = results;
    next();
  }
}

function renderPageTemplate(req, res, next) {
  var view = {
  	username: req.params.username,
  	signupDateTime: res.userData.signupDateTime,
    images: res.userImages,
    comments: res.userComments
  }
  res.pageContent = mustache.render(res.pageContent, view);
  next();
}

var stylesheets = [{href: "images.css"},{href: "comments.css"}];
var scripts = [];
router.get("/:username", loadPageTemplate, getUserData, getUserImages, getUserComments, renderPageTemplate, mw.renderPage(stylesheets,scripts));

module.exports = router;
