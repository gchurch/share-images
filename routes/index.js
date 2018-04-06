"use strict";

var express = require("express");
var router = express.Router();
var fs = require("fs");
var database = require("./../database/database.js");
var mustache = require("mustache");
var mw = require("./../middleware.js");


//load the index page content
function loadIndexTemplate(req, res, next) {
  fs.readFile("views/index.mustache", "utf8", done);

  //callback function
  function done(err, content) {
    if(err) console.log(err);
    res.pageContent = content;
    next();
  }
}

//get all of the images in the database
function getLatestImages(req, res, next) {
  database.getLatestImages(done);

  //callback function
  function done(result) {
    res.images = result;
    next();
  }
}

//render the page content with the images
function renderIndexTemplate(req, res, next) {
  res.pageContent = mustache.render(res.pageContent, {images: res.images});
  next();
}

// GET home page.
var stylesheets = [{href: "index.css"}];
var scripts = [];
router.get('/', loadIndexTemplate, getLatestImages, renderIndexTemplate, mw.renderPage(stylesheets,scripts));

module.exports = router;
