"use strict";

const express = require("express");
const router = express.Router();
const fs = require("fs");
const mustache = require("mustache");
const database = require("./../database/database.js");
const mw = require("./../middleware.js");

//delete the session associated with this account
function deleteSession(req, res, next) {
  database.deleteSessionByCookie(req.cookies.session, done);
  
  //callback function
  function done() {
  	console.log(res.username + " logged out.");
  	res.username = null;
    next();
  }
}

//load the login success page template
function loadLogoutTemplate(req, res, next) {
  fs.readFile("views/logout.mustache", "utf8", done);

  //callback function
  function done(err, content) {
    if(err) throw(err);
    res.pageContent = content;
    next();
  }
}

// GET request for logout page
var stylesheets = [];
var scripts = [];
router.get('/', deleteSession, loadLogoutTemplate, mw.renderPage(stylesheets, scripts));

module.exports = router;
