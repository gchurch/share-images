"use strict";

var express = require("express");
var router = express.Router();
var database = require("./../database/database.js");

//delete the session associated with this account
function deleteSession(req, res, next) {
  console.log("OMG");
  database.deleteSessionByCookie(req.cookies.session, done);
  
  //callback function
  function done() {
    next();
  }
}

//redirect the request to the homepage
function redirect(req, res, next) {
	res.redirect("/");
}

// GET request for logout page
router.get('/', deleteSession, redirect);

module.exports = router;
