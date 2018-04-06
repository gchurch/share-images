"use strict"

var express = require("express");
var router = express.Router();
var fs = require("fs");
var database = require("./../database/database.js");
var mustache = require("mustache");
var mw = require("./../middleware");

var multer = require('multer');
var upload = multer({dest: 'public/images/uploads/'});

//load the index page content
function loadUploadTemplate(req, res, next) {
	fs.readFile("views/upload.mustache", "utf8", done);
  
  //callback function
  function done(err, content) {
    if(err) console.log(err);
    res.pageContent = content;
    next();
  }
}

//load the upload fail page template
function loadUploadFailedTemplate(req, res, next) {
	fs.readFile("views/upload-failed.mustache", "utf8", done);

  //callback function
	function done(err, content) {
		if(err) console.log(err);
		res.pageContent = content;
		next();
	}
}

//load the upload succeeded page template
function loadUploadSucceededTemplate(req, res, next) {
  fs.readFile("views/upload-succeeded.mustache", "utf8", done);

  //callback function
  function done(err, content) {
    if(err) console.log(err);
    res.pageContent = content;
    next();
  }
}

//GET requests for upload pages
var stylesheets = [{href: "upload.css"}];
var scripts = [];
router.get('/', loadUploadTemplate, mw.renderPage(stylesheets, scripts));
router.get('/failed', loadUploadFailedTemplate, mw.renderPage(stylesheets, scripts));
router.get('/succeeded', loadUploadSucceededTemplate, mw.renderPage(stylesheets, scripts));


//add provided image and info to the database
function addImageToDatabase(req, res, next) {
  //if an image was provided then add an entry to the database
  if(req.file && res.username) {
    //if no title is given then call the image "untitled"
    if(req.body.image_title == "") {
      req.body.image_title = "untitled";
    }
    //add a row to the image table
    database.addImage(res.username, req.body.image_title, req.file.filename, done);

    //callback function
    function done() {
      console.log("New image uploaded.");
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
