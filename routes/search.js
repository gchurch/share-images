"use strict"

const express = require("express");
const router = express.Router();
const fs = require("fs");
const database = require("./../database/database.js");
const mustache = require("mustache");
const mw = require("./../middleware.js");


//load the index page content
function loadSearchTemplate(req, res, next) {
  fs.readFile("views/search.mustache", "utf8", done);

  //callback function
  function done(err, content) {
    if(err) throw(err);
    res.pageContent = content;
    next();
  }
}

//get all of the images in the database
function getAllImages(req, res, next) {
  database.getAllImages(done);
  
  //callback function
  function done(result, fields) {
    res.result = result;
    next();
  }
}

//render the search template with the images
function renderSearchTemplate(req, res, next) {
  res.pageContent = mustache.render(res.pageContent, {results: res.result});
  next();
}

// GET request for search page
var stylesheets = [{href: "images.css"}];
var scripts = [];
router.get('/', loadSearchTemplate, getAllImages, renderSearchTemplate, mw.renderPage(stylesheets, scripts));

module.exports = router;
