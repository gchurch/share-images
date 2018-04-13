"use strict";

const express = require("express");
const router = express.Router();
const database = require("./../database/database.js");

//delete the session associated with this account
function deleteSession(req, res, next) {
  database.deleteSessionByCookie(req.cookies.session, done);
  
  //callback function
  function done() {
  	console.log(res.username + " logged out.");
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
