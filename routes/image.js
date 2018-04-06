"use strict";

var express = require('express');
var router = express.Router();
var fs = require("fs");
var mustache = require("mustache");
var database = require("./../database.js");
var mw = require("./../middleware.js");


//retrieve the requested image data from the database
function getImageData(req, res, next) {
  var id = req.params.id;
  database.getImageDataById(id, done);

  //callback function
  function done(result) {
    if(result[0]) {
      res.image = result[0];
    }
    next();
  }
}

//retrieve all of the comments for the requested image
function getImageComments(req, res, next) {
  var id = req.params.id;
  database.getImageCommentsById(id, done);

  //callback function
  function done(result) {
    if(result) {
      res.comments = result;
    }
    next();
  }
}

//load the file containing the template of the page
function loadImagePageTemplate(req, res, next) {
  if(res.image) {
    fs.readFile("views/image.mustache", "utf8", done);
  }
  else {
  	fs.readFile("views/noimage.mustache", "utf8", done);
  }

  //callback function
  function done(err, content) {
    if(err) console.log(err);
    res.pageContent = content;
    next();
  }
}

//render the template with the data retreived from the database
function renderImagePageTemplate(req, res, next) {
  if(res.image) {
    res.pageContent = mustache.render(res.pageContent, {image: res.image, comments: res.comments});
  }
  next();
}

//GET request for a specfic image id
var stylesheets = [{href: "image.css"}];
var scripts = [];
router.get('/:id', getImageData, getImageComments, loadImagePageTemplate, renderImagePageTemplate, mw.renderPage(stylesheets, scripts));


//Add comment to the database
function addCommentToDatabase(req, res, next) {
  //check that the comment actually contains some text and also that the use is logged in to an account
  if(req.body.text && res.username) {
    database.addCommentToImage(res.username, req.params.id, req.body.text, done);

    //callback function
    function done() {
      console.log("New comment added.");
      next();
    }
  }
  else {
    next();
  }
}

//redirect the request to the page for the image
function redirect(req, res, next) {
  var id = req.params.id;
  res.redirect("/image/" + id);
}

//POST comment to specific image id
router.post('/:id', addCommentToDatabase, redirect);

module.exports = router;