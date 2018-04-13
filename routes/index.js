"use strict";

const express = require("express");
const router = express.Router();
const fs = require("fs");
const database = require("./../database/database.js");
const mustache = require("mustache");
const mw = require("./../middleware.js");


//load the index page content
function loadIndexTemplate(req, res, next) {
  fs.readFile("views/index.mustache", "utf8", done);

  //callback function
  function done(err, content) {
    if(err) throw(err);
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
var stylesheets = [{href: "images.css"}];
var scripts = [];
router.get('/', loadIndexTemplate, getLatestImages, renderIndexTemplate, mw.renderPage(stylesheets,scripts));

module.exports = router;
