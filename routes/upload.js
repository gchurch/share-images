"use strict"

const express = require("express");
const router = express.Router();
const fs = require("fs");
const database = require("./../database/database.js");
const mustache = require("mustache");
const mw = require("./../middleware");

const multer = require('multer');
const upload = multer({dest: 'public/images/uploads/'});

const imageTitleMaxLength = 30;

//load the index page content
function loadUploadTemplate(req, res, next) {
	fs.readFile("views/upload.mustache", "utf8", done);
  
  //callback function
  function done(err, content) {
    if(err) throw(err);
    res.pageContent = content;
    next();
  }
}

//load the upload fail page template
function loadUploadFailedTemplate(req, res, next) {
	fs.readFile("views/upload-failed.mustache", "utf8", done);

  //callback function
	function done(err, content) {
		if(err) throw(err);
		res.pageContent = content;
		next();
	}
}

//load the upload succeeded page template
function loadUploadSucceededTemplate(req, res, next) {
  fs.readFile("views/upload-succeeded.mustache", "utf8", done);

  //callback function
  function done(err, content) {
    if(err) throw(err);
    res.pageContent = content;
    next();
  }
}

function renderUploadTemplate(req, res, next) {
  res.pageContent = mustache.render(res.pageContent, {imageTitleMaxLength: imageTitleMaxLength});
  next();
}

//GET requests for upload pages
var stylesheets = [{href: "upload.css"}];
var scripts = [{src: "upload.js"}];
router.get('/', loadUploadTemplate, renderUploadTemplate, mw.renderPage(stylesheets, scripts));
router.get('/failed', loadUploadFailedTemplate, mw.renderPage(stylesheets, scripts));
router.get('/succeeded', loadUploadSucceededTemplate, mw.renderPage(stylesheets, scripts));


//add provided image and info to the database
function addImageToDatabase(req, res, next) {
  //if an image was provided then add an entry to the database
  if(req.file && res.username && req.body.image_title.length <= imageTitleMaxLength) {
    //if no title is given then call the image "untitled"
    if(req.body.image_title == "") {
      req.body.image_title = "untitled";
    }
    //add a row to the image table
    database.addImage(res.username, req.body.image_title, req.file.filename, done);

    //callback function
    function done() {
      console.log(res.username + " uploaded an image.");
      res.successfulImageUpload = true;
      next();
    }
  }
  else {
    res.successfulImageUpload = false;
    next();
  }
}

//redirect to the appropriate page
function redirect(req, res, next) {
  //redirect to the appropriate page
  if(res.successfulImageUpload) {
    res.redirect('/upload/succeeded');
  } else {
    res.redirect('/upload/failed');
  }
}

//POST request to upload an image
router.post('/post-image', upload.single('image'), addImageToDatabase, redirect);

module.exports = router;
