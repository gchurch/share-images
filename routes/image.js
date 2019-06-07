"use strict";

const express = require("express");
const router = express.Router();
const fs = require("fs");
const mustache = require("mustache");
const database = require("./../database/database.js");
const mw = require("./../middleware.js");

//max number of characters for a comment
const maxCommentLength = 100;


//retrieve the requested image data from the database
function getImageData(req, res, next) {
  var id = req.params.id;
  database.getImageDataById(id, done);

  //callback function
  function done(result) {
    if(result) {
      res.imageData = result;
    }
    next();
  }
}

//retrieve all of the comments for the requested image
function getImageComments(req, res, next) {
  var id = req.params.id;
  database.getCommentsByImageID(id, done);

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
  if(res.imageData) {
    fs.readFile("views/image.mustache", "utf8", done);
  }
  else {
  	fs.readFile("views/noimage.mustache", "utf8", done);
  }

  //callback function
  function done(err, content) {
    if(err) throw(err);
    res.pageContent = content;
    next();
  }
}

//render the template with the data retreived from the database
function renderImagePageTemplate(req, res, next) {
  if(res.imageData) {
    res.pageContent = mustache.render(res.pageContent, {image: res.imageData, comments: res.comments, maxCommentLength: maxCommentLength});
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
  if(req.body.text && res.username && req.body.text.length <= maxCommentLength) {
    database.addCommentToImage(res.username, req.params.id, req.body.text, done);

    //callback function
    function done() {
      console.log(res.username + " posted a comment.");
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