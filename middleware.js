"use strict";

var fs = require("fs");
var database = require("./database/database.js");
var mustache = require("mustache");

function getSessionUsername(req, res, next) {
  database.getSessionUsername(req.cookies.session, done);

  //callback function
  function done(username) {
    res.username = username;
    next();
  }
}
module.exports.getSessionUsername = getSessionUsername;

function renderPage(stylesheets, scripts) {
  return function(req, res, next) {
    if(res.username) {
      var account1String = "<p>Logged in as <a href='/user/" + res.username +"'>" + res.username + "</a></p>";
      var account2String = "<p><a href='/logout'>Logout</a></p>";
    }
    else {
      var account1String = "<p><a href='/login'>Login</a></p>";
      var account2String = "<p><a href='/signup'>Signup</a></p>";
    }
    res.render('layout', {stylesheets: stylesheets, scripts: scripts, account1: account1String, account2: account2String, content: res.pageContent});
  }
}
module.exports.renderPage = renderPage;