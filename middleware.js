"use strict";

const fs = require("fs");
const database = require("./database/database.js");
const mustache = require("mustache");

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
      var accountString = "Logged in as <a id='username' href='/user/" + res.username +"'>" + res.username + "</a> | <a href='/logout'>Log out</a>";
    }
    else {
      var accountString = "<a href='/login'>Log in</a> | <a href='/signup'>Sign up</a>";
    }
    res.render('layout', {stylesheets: stylesheets, scripts: scripts, account: accountString, content: res.pageContent});
  }
}
module.exports.renderPage = renderPage;