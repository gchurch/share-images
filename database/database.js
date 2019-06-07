"use strict";

const fs = require('fs');
const crypto = require('crypto');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database("database/data.db");

var imageLimit = 6;


/*************PREPARED STATEMENTS*************/


var insertIntoCommentsPs = db.prepare("INSERT INTO Comments ( userID, imageID, text) VALUES ( ?, ?, ? );");
var insertIntoImagesPs = db.prepare("INSERT INTO Images ( userID, title, path ) VALUES ( ?, ? ,? );");
var insertIntoUsersPs = db.prepare("INSERT INTO Users ( username, salt, iterations, login_key ) VALUES ( ?, ?, ?, ?);");
var insertIntoSessionsPs = db.prepare("INSERT INTO Sessions ( cookie, userID ) VALUES ( ?, ?);");
var selectLatestImagesPs = db.prepare("SELECT Images.imageID, Users.username, Images.title, Images.path FROM Users JOIN Images ON Users.userID = Images.userID ORDER BY Images.imageID DESC LIMIT ?;");
var selectAllImagesPs = db.prepare("SELECT Images.imageID, Users.username, Images.title, Images.path FROM Users JOIN Images ON Users.userID = Images.userID ORDER BY Images.title;");
var selectUsernamePs = db.prepare("SELECT username FROM Users WHERE username = ? LIMIT 1;");
var selectLoginInfoByUsernamePs = db.prepare("SELECT salt, iterations, login_key FROM Users WHERE username = ? LIMIT 1;");
var deleteSessionByCookiePs = db.prepare("DELETE FROM Sessions WHERE cookie = ?;");
var selectUserIdByUsernamePs = db.prepare("SELECT userID FROM Users WHERE username = ? LIMIT 1;");
var deleteSessionByUserIdPs = db.prepare("DELETE FROM Sessions WHERE userID = ?;");
var selectUserIdByCookiePs = db.prepare("SELECT userID FROM Sessions WHERE cookie = ? LIMIT 1;");
var selectUsernameByUserIdPs = db.prepare("SELECT username FROM Users WHERE userID = ? LIMIT 1;");
var selectImagesByUsernamePs = db.prepare("SELECT Images.imageID, Users.username, Images.title, Images.path FROM Users JOIN Images ON Users.userID = Images.userID WHERE Users.username = ?;");
var selectImageByImageIdPs = db.prepare("SELECT Users.username, Images.title, Images.path, uploadDateTime FROM Users JOIN Images ON Users.userID = Images.userID WHERE Images.imageID = ?;");
var selectCommentsByImageIdPs = db.prepare("SELECT Users.username, Comments.imageID, Comments.text, postDateTime FROM Users JOIN Comments ON Users.userID = Comments.userID WHERE Comments.imageID = ? ORDER BY Comments.commentID;");
var selectCommentsByUsernamePs = db.prepare("SELECT Comments.imageID, Comments.text, postDateTime From Users JOIN Comments ON Users.userID = Comments.userID WHERE Users.username = ?;");
var selectUserDataByUsernamePs = db.prepare("SELECT signupDateTime FROM Users WHERE username = ?;");


/***************FUNCTIONS TO EXECUTE PREPARED STATEMENTS********************/

function insertIntoComments(userId, imageId, text, callback) {
  insertIntoCommentsPs.all(userId, imageId, text, function(err) {
    if (err) throw err;
    callback();
  });
}

function insertIntoImages(userId, title, path, callback) {
  insertIntoImagesPs.all(userId, title, path, function(err) {
    if (err) throw err;
    callback();
  });
}

function insertIntoUsers(username, salt, iterations, login_key, callback) {
  insertIntoUsersPs.all(username, salt, iterations, login_key, function(err) {
    if (err) throw err;
    callback();
  });
}

function insertIntoSessions(cookie, userId, callback) {
  insertIntoSessionsPs.all(cookie, userId, function(err) {
    if (err) throw err;
    callback();
  });
}

function selectLatestImages(callback) {
  selectLatestImagesPs.all(imageLimit, function(err, result) {
    if (err) throw err;
    callback(result);
  });
}

function selectAllImages(callback) {
  selectAllImagesPs.all(function(err, result) {
    if (err) throw err;
    callback(result);
  });
}

function selectUsername(username, callback) {
  selectUsernamePs.all(username, function(err, result) {
    if (err) throw err;
    callback(result);
  });
}

function selectLoginInfoByUsername(username, callback) {
  selectLoginInfoByUsernamePs.all(username, function(err, result) {
    if (err) throw err;
    callback(result)
  });
}

function deleteSessionByCookie(cookie, callback) {
  deleteSessionByCookiePs.all(cookie, function(err) {
    if (err) throw err;
    callback();
  });
}
module.exports.deleteSessionByCookie = deleteSessionByCookie;

function selectUserIdByUsername(username, callback) {
  selectUserIdByUsernamePs.all(username, function(err, result) {
    if (err) throw err;
    callback(result);
  });
}

function deleteSessionByUserId(userId, callback) {
  deleteSessionByUserIdPs.all(userId, function(err) {
    if (err) throw err;
    callback();
  });
}

function selectUserIdByCookie(cookie, callback) {
  selectUserIdByCookiePs.all(cookie, function(err, result) {
    if (err) throw err;
    callback(result);
  });
}

function selectUsernameByUserId(userId, callback) {
  selectUsernameByUserIdPs.all(userId, function(err, result) {
    if (err) throw err;
    callback(result);
  });
}

function selectImagesByUsername(username, callback) {
  selectImagesByUsernamePs.all(username, function(err, result) {
    if (err) throw err;
    callback(result);
  });
}

function selectImageByImageId(imageId, callback) {
  selectImageByImageIdPs.all(imageId, function(err, result) {
    if (err) throw err;
    callback(result);
  });
}

function selectCommentsByImageId(imageId, callback) {
  selectCommentsByImageIdPs.all(imageId, function(err, result) {
    if (err) throw err;
    callback(result);
  });
}

function selectCommentsByUsername(username, callback) {
  selectCommentsByUsernamePs.all(username, function(err, result) {
    if (err) throw err;
    callback(result);
  });
}

function selectUserDataByUsername(username, callback) {
  selectUserDataByUsernamePs.all(username, function(err, result) {
    if (err) throw err;
    callback(result);
  });
}

/*************IMAGE DATA FUNCTIONS************/

//Get the latest images stored in the database
function getLatestImages(callback) {
  selectLatestImages(callback);
}
module.exports.getLatestImages = getLatestImages;

//Get all images stored in the database
function getAllImages(callback) {
  selectAllImages(callback);
}
module.exports.getAllImages = getAllImages;

//Add an image to the database
function addImage(username, title, path, callback) {
  getUserIDFromUsername(username, function(userId) {
    insertIntoImages(userId, title, path, callback);
  });
}
module.exports.addImage = addImage;

//Get data of an image by supplying an id
function getImageDataById(imageId, callback) {
  selectImageByImageId(imageId, function(result) {
    callback(result[0]);
  });
}
module.exports.getImageDataById = getImageDataById;



/*************COMMENTS*******************/

//Get the comments for an image
function getCommentsByImageID(imageId, callback) {
  selectCommentsByImageId(imageId, function(result) {
    callback(result);
  });
}
module.exports.getCommentsByImageID = getCommentsByImageID;

//Add a comment to an image
function addCommentToImage(username, imageId, text, callback) {
  selectUserIdByUsername(username, function(result) {
    var userId = result[0].userID;
    insertIntoComments(userId, imageId, text, callback);
  });
}
module.exports.addCommentToImage = addCommentToImage;

//Get comments placed by a user
function getUserComments(username, callback) {
  selectCommentsByUsername(username, function(result) {
    callback(result);
  });
}
module.exports.getUserComments = getUserComments;


/*************CRYPTO FUNCTIONS***************/



function randomData() {
  return crypto.randomBytes(64).toString('hex');
}

function saltHashAndStretch(password, salt, iterations) {
  var key = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
  return key;
}



/*************SIGN UP FUNCTIONS*************/

//Create a new account
function createAccount(username, password, callback) {
  var salt = randomData();
  var iterations = 100000;
  var login_key = saltHashAndStretch(password, salt, iterations);

  insertIntoUsers(username, salt, iterations, login_key, callback);
}
module.exports.createAccount = createAccount;

//Check whether a given username already exists
function checkUsernameAlreadyExists(username, callback) {
  selectUsername(username, function(result) {
    if(result[0]) {
      callback(true);
    }
    else {
      callback(false);
    }
  });
}
module.exports.checkUsernameAlreadyExists = checkUsernameAlreadyExists;



/**************LOGIN FUNCTIONS*****************/

//Check that the supplied login credentials are correct
function checkLoginDetails(username, password, callback) {
  selectLoginInfoByUsername(username, function(result) {
    if(result[0]) {
      if(saltHashAndStretch(password, result[0].salt, result[0].iterations) == result[0].login_key) {
        callback(true);
      }
      else {
        callback(false);
      }
    }
    else {
      callback(false);
    }
  });
}
module.exports.checkLoginDetails = checkLoginDetails;


function getUserIDFromUsername(username, callback) {
  selectUserIdByUsername(username, function(result) {
    if(result[0]) {
      callback(result[0].userID);
    }
    else {
      callback(null);
    }
  });
}

function createSession(username, callback) {
  var cookie = randomData();

  getUserIDFromUsername(username, step1);

  //delete the current session
  function step1(userID) {
    deleteSessionByUserId(userID, next);
    //call next function
    function next() {
      step2(userID);
    }
  }

  //add new entry to the table for the current session
  function step2(userID) {
    insertIntoSessions(cookie, userID, done);
    //call next function
    function next() {
      done();
    }
  }

  //callback function
  function done() {
    callback(cookie);
  }
}
module.exports.createSession = createSession;

function getUserIDFromCookie(cookie, callback) {
  selectUserIdByCookie(cookie, function(result) {
    if(result[0]) {
      callback(result[0].userID);
    }
    else {
      callback(null);
    }
  });
}

function getUsernameFromUserID(userID, callback) {
  selectUsernameByUserId(userID, function(result) {
    callback(result[0].username);
  });
}

function getSessionUsername(cookie, callback) {

  //get the userID from the cookie
  getUserIDFromCookie(cookie, getUsername);

  //get the username from the userID
  function getUsername(userID) {
    if(userID) {
      getUsernameFromUserID(userID, done);
    }
    else {
      done(null);
    }
  }

  //callback function
  function done(username) {
    if(username) {
      callback(username);
    }
    else {
      callback(null);
    }
  }
}
module.exports.getSessionUsername = getSessionUsername;



/**********USER DATA******************/


function getUserData(username, callback) {
  selectUserDataByUsername(username, function(result) {
    if(result[0]) {
      callback(result[0]);
    }
    else {
      callback(null);
    }
  });
}
module.exports.getUserData = getUserData;


function getUserImages(username, callback) {
  selectImagesByUsername(username, function(result) {
    callback(result);
  });
}
module.exports.getUserImages = getUserImages;