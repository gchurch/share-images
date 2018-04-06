"use strict";

var mysql = require('mysql');
var fs = require('fs');
var crypto = require('crypto');

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "MYAPP"
});

/*
var connection = mysql.createConnection({
  host: String(process.env.MYSQLCS_HOST),
  user: String(process.env.MYSQLCS_USER),
  password: String(process.env.MYSQLCS_PASSWORD),
  database: String(process.env.MYSQLCS_DATABASE)
});
*/

var imageLimit = 6;



/***********DATABASE CONNECTION**************/



//connect the server to the database
function connectToDatabase() {
  connection.connect(function(err) {
    if (err) {
      console.log('error connecting to database: ' + err.stack);
  	    return;
      }
    console.log('connected to database');
  });
}
module.exports.connectToDatabase = connectToDatabase;

//end the servers connection to the database
function endDatabaseConnection() {
  connection.end(function(err) {
    console.log('connection to database closed')
  })
}
module.exports.endDatabaseConnection = endDatabaseConnection;



/*************IMAGE DATA FUNCTIONS************/



function getLatestImages(callback) {
  var query = "SELECT Images.imageID, Users.username, Images.title, Images.path FROM Users JOIN Images ON Users.userID = Images.userID ORDER BY Images.imageID DESC LIMIT " + imageLimit + ";";
  connection.query(query, done);

  //callback function
  function done(err, result) {
    if (err) throw err;
    callback(result);
  };
}
module.exports.getLatestImages = getLatestImages;

//callback function recieves all of the image data in the database
function getAllImages(callback) {
  var query = "SELECT Images.imageID, Users.username, Images.title, Images.path FROM Users JOIN Images ON Users.userID = Images.userID ORDER BY Images.title;";
  connection.query(query, done);

  //callback function
  function done(err, result) {
    if (err) throw err;
    callback(result);
  }
}
module.exports.getAllImages = getAllImages;

function insertImageEntry(userID, title, path, callback) {
  var query = "INSERT INTO Images ( userID, title, path ) VALUES ( '" + userID + "', '" + title + "', '" + path + "' );";
  connection.query(query, done);

  //callback function
  function done(err) {
    if (err) throw err;
    callback();
  }
}

//add Entry
function addImage(username, title, path, callback) {
  getUserIDFromUsername(username, done);

  //callback function
  function done(userID) {
    insertImageEntry(userID, title, path, callback);
  }
}
module.exports.addImage = addImage;

//get individual image data
function getImageDataById(id, callback) {
  var query = "SELECT Users.username, Images.title, Images.path FROM Users JOIN Images ON Users.userID = Images.userID WHERE Images.imageID = '" + id + "';";
  connection.query(query, done);

  //callback function
  function done(err, result) {
    if (err) throw err;
    callback(result);
  };
}
module.exports.getImageDataById = getImageDataById;

function getImageCommentsById(imageID, callback) {
  var query = "SELECT Users.username, Comments.imageID, Comments.text FROM Users JOIN Comments ON Users.userID = Comments.userID WHERE Comments.imageID = '" + imageID + "' ORDER BY Comments.commentID DESC;";
  connection.query(query, done);

  //callback function
  function done(err, result) {
    if (err) throw err;
    callback(result);
  };
}
module.exports.getImageCommentsById = getImageCommentsById;

function insertCommentEntry(userID, imageID, text, callback) {
  var query = "INSERT INTO Comments ( userID, imageID, text ) VALUES ( '" + userID + "', '" + imageID + "', '" + text + "' );";
  connection.query(query, done);

  //callback function
  function done(err) {
    if(err) throw err;
    callback();
  }
}

function addCommentToImage(username, imageID, text, callback) {
   getUserIDFromUsername(username, done);

   //callback function
   function done(userID) {
     insertCommentEntry(userID, imageID, text, callback);
   }
}
module.exports.addCommentToImage = addCommentToImage;



/*************CRYPTO FUNCTIONS***************/



function randomData() {
  return crypto.randomBytes(64).toString('hex');
}

function saltHashAndStretch(password, salt, iterations) {
  var key = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
  return key;
}



/*************SIGN UP FUNCTIONS*************/



function createAccount(username, password, callback) {
  var salt = randomData();
  var iterations = 100000;
  var key = saltHashAndStretch(password, salt, iterations);
  var query = "INSERT INTO Users ( username, salt, iterations, login_key ) VALUES ( '" + username + "', '" + salt + "', '" + iterations + "', '" + key + "' );";
  connection.query(query, done);

  //callback function
  function done(err) {
    if (err) throw err;
    callback();
  };
}
module.exports.createAccount = createAccount;

function checkUsernameAlreadyExists(username, callback) {
  var query = "SELECT username FROM Users WHERE username='" + username + "' LIMIT 1;";
  connection.query(query, done);

  //callback function
  function done(err, result, fields) {
    if(err) throw err;
    if(result[0]) {
      callback(true);
    } else {
      callback(false);
    }
  };
}
module.exports.checkUsernameAlreadyExists = checkUsernameAlreadyExists;



/**************LOGIN FUNCTIONS*****************/



function checkLoginDetails(username, password, callback) {
  var query = "SELECT salt, iterations, login_key FROM Users WHERE username='" + username + "' LIMIT 1;";
  connection.query(query, done);

  //callback function
  function done(err, result, fields) {
    if(err) throw err;
    //check the password matches
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
  }
}
module.exports.checkLoginDetails = checkLoginDetails;


function deleteSessionByCookie(cookie, callback) {
  var query = "DELETE FROM Sessions WHERE cookie = '" + cookie + "' LIMIT 1;";
  connection.query(query, done);

  //callback function
  function done() {
    callback();
  }
}
module.exports.deleteSessionByCookie = deleteSessionByCookie;

function getUserIDFromUsername(username, callback) {
  var query = "SELECT userID FROM Users WHERE username='" + username + "' LIMIT 1;";
  connection.query(query, done);

  //callback function
  function done(err, result) {
    if(err) throw err;
    if(result[0]) {
      callback(result[0].userID);
    }
    else {
      callback(null);
    }
  }
}

function deleteSessionByUserID(userID, callback) {
  var query = "DELETE FROM Sessions WHERE userID = '" + userID + "' LIMIT 1;";
  connection.query(query, done);

  //callback function
  function done(err, result) {
    if(err) throw err;
    callback(result);
  }
}

function insertSessionEntry(cookie, userID, callback) {
  var query = "INSERT INTO Sessions ( cookie, userID ) VALUES ( '" + cookie + "', '" + userID + "' );";
  connection.query(query, done);

  //callback function
  function done(err, result) {
    if(err) throw err;
    callback();
  }
}

function createSession(username, callback) {
  var cookie = randomData();

  getUserIDFromUsername(username, step1);

  //delete the current session
  function step1(userID) {
    deleteSessionByUserID(userID, next);
    //call next function
    function next() {
      step2(userID);
    }
  }

  //add new entry to the table for the current session
  function step2(userID) {
    insertSessionEntry(cookie, userID, done);
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
  var query = "SELECT userID FROM Sessions WHERE cookie = '" + cookie + "' LIMIT 1;";
  connection.query(query, done);

  //callback function
  function done(err, result) {
    if(err) throw err;
    if(result[0]) {
      callback(result[0].userID);
    }
    else {
      callback(null);
    }
  }
}

function getUsernameFromUserID(userID, callback) {
  var query = "SELECT username FROM Users WHERE userID='" + userID + "' LIMIT 1;";
  connection.query(query, done);

  //callback function
  function done(err, result) {
    if(err) throw err;
    callback(result[0].username);
  }
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

function getUserData(username, callback) {
  var query = "SELECT signupDate FROM Users WHERE username = '" + username + "';";
  connection.query(query, done);

  //callback function
  function done(err, results) {
    if(err) throw err;
    if(results[0]) {
      callback(results[0]);
    }
    else {
      callback(null);
    }
  }
}
module.exports.getUserData = getUserData;