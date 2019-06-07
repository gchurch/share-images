"use strict";

const mysql = require('mysql');
const fs = require('fs');
const crypto = require('crypto');
const sqlite3 = require('sqlite3');

const connection = mysql.createConnection({
  multipleStatements: true,
  host: "localhost",
  user: "root",
  password: "password",
  database: "ShareImages"
});

const db = new sqlite3.Database("database/data.db");

var imageLimit = 6;



/***********DATABASE CONNECTION**************/



//connect the server to the mysql database
function connectToDatabase() {
  connection.connect(done);

  function done(err) {
    if (err) {
      console.log('error connecting to database: ' + err.stack);
    }
    else {
      console.log('connected to database');
      //create all the prepared statements, these will be used for all of our queries
      createServerSidePreparedStatements();
    }
  };
}
module.exports.connectToDatabase = connectToDatabase;



/*************PREPARED STATEMENTS*************/



function createServerSidePreparedStatements() {
  var query = 
  "PREPARE insertIntoComments FROM 'INSERT INTO Comments ( userID, imageID, text) VALUES ( ?, ?, ? );';" +
  "PREPARE insertIntoImages FROM 'INSERT INTO Images ( userID, title, path ) VALUES ( ?, ? ,? );';" +
  "PREPARE insertIntoUsers FROM 'INSERT INTO Users ( username, salt, iterations, login_key ) VALUES ( ?, ?, ?, ?);';" + 
  "PREPARE insertIntoSessions FROM 'INSERT INTO Sessions ( cookie, userID ) VALUES ( ?, ?);';" + 
  "PREPARE selectLatestImages FROM 'SELECT Images.imageID, Users.username, Images.title, Images.path FROM Users JOIN Images ON Users.userID = Images.userID ORDER BY Images.imageID DESC LIMIT ?;';" +
  "PREPARE selectAllImages FROM 'SELECT Images.imageID, Users.username, Images.title, Images.path FROM Users JOIN Images ON Users.userID = Images.userID ORDER BY Images.title;';" +
  "PREPARE selectUsername FROM 'SELECT username FROM Users WHERE username = ? LIMIT 1;';" +
  "PREPARE selectLoginInfo FROM 'SELECT salt, iterations, login_key FROM Users WHERE username = ? LIMIT 1;';" +
  "PREPARE deleteSessionByCookie FROM 'DELETE FROM Sessions WHERE cookie = ? LIMIT 1;';" + 
  "PREPARE selectUserIDFromUsername FROM 'SELECT userID FROM Users WHERE username = ? LIMIT 1;';" +
  "PREPARE deleteSessionByUserID FROM 'DELETE FROM Sessions WHERE userID = ? LIMIT 1;';" +
  "PREPARE selectUserIDByCookie FROM 'SELECT userID FROM Sessions WHERE cookie = ? LIMIT 1;';" +
  "PREPARE selectUsernameByUserID FROM 'SELECT username FROM Users WHERE userID = ? LIMIT 1;';" +
  "PREPARE selectImagesByUser FROM 'SELECT Images.imageID, Users.username, Images.title, Images.path FROM Users JOIN Images ON Users.userID = Images.userID WHERE Users.username = ?;';" +
  "PREPARE selectImageByImageID FROM 'SELECT Users.username, Images.title, Images.path, DATE_FORMAT(Images.uploadDateTime, \"%H:%i:%s %d/%m/%y\") as uploadDateTime FROM Users JOIN Images ON Users.userID = Images.userID WHERE Images.imageID = ?;';" +
  "PREPARE selectCommentsByImageID FROM 'SELECT Users.username, Comments.imageID, Comments.text, DATE_FORMAT(Comments.postDateTime, \"%H:%i:%s %d/%m/%y\") as postDateTime FROM Users JOIN Comments ON Users.userID = Comments.userID WHERE Comments.imageID = ? ORDER BY Comments.commentID;';" +
  "PREPARE selectCommentsByUsername FROM 'SELECT Users.username, Comments.imageID, Comments.text, DATE_FORMAT(postDateTime, \"%H:%i:%s %d/%m/%y\") as postDateTime From Users JOIN Comments ON Users.userID = Comments.userID WHERE Users.username = ?;';" +
  "PREPARE selectUserData FROM 'SELECT DATE_FORMAT(signupDateTime, \"%H:%i:%s %d/%m/%y\") as signupDateTime FROM Users WHERE username = ?;';";
  connection.query(query, done);

  //callback function
  function done(err) {
    if(err) throw err;
    console.log("Prepared statements done.");
  }
}


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
var selectImageByImageIdPs = db.prepare("SELECT Users.username, Images.title, Images.path, strftime(\"%H:%i:%s %d/%m/%y\", Images.uploadDateTime) as uploadDateTime FROM Users JOIN Images ON Users.userID = Images.userID WHERE Images.imageID = ?;");
var selectCommentsByImageIdPs = db.prepare("SELECT Users.username, Comments.imageID, Comments.text, strftime(\"%H:%i:%s %d/%m/%y\", Comments.postDateTime) as postDateTime FROM Users JOIN Comments ON Users.userID = Comments.userID WHERE Comments.imageID = ? ORDER BY Comments.commentID;");
var selectCommentsByUsernamePs = db.prepare("SELECT Users.username, Comments.imageID, Comments.text, strftime(\"%H:%i:%s %d/%m/%y\", postDateTime) as postDateTime From Users JOIN Comments ON Users.userID = Comments.userID WHERE Users.username = ?;");
var selectUserDataByUsernamePs = db.prepare("SELECT strftime(\"%H:%i:%s %d/%m/%y\", signupDateTime) as signupDateTime FROM Users WHERE username = ?;");


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
    console.log(result);
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

function selectUserIdByUsername(username, callback) {
  selectUserIdByUsernamePs.all(username, function(err, result) {
    if (err) throw err;
    callback(result);
  });
}

function deleteSessionByUserId(userId, callback) {
  deleteSessionBuyUserIdPs.all(userId, function(err) {
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

function selectUserDatByUsername(username, callback) {
  selectUserDataByUsernamePs.all(username, function(err, result) {
    if (err) throw err;
    callback(result);
  });
}

/*************IMAGE DATA FUNCTIONS************/

//Get the latest images stored in the database
function getLatestImages(callback) {
  selectLatestImages(function(result) {
    callback(result[1]);
  });
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
function getImageById(imageId, callback) {
  selectImageByImageId(imageId, function(result) {
    callback(result[1]);
  });
}
module.exports.getImageById = getImageById;



/*************COMMENTS*******************/

//Get the comments for an image
function getCommentsByImageID(imageId, callback) {
  selectCommentsByImageId(imageId, function(result) {
    callback(result[1]);
  });
}
module.exports.getCommentsByImageID = getCommentsByImageID;

//Add a comment to an image
function addCommentToImage(username, imageID, text, callback) {
  selectUserIdByUsername(username, function(userId) {
    insertIntoComments(userId, imageId, text, callback);
  });
}
module.exports.addCommentToImage = addCommentToImage;

//Get comments placed by a user
function getUserComments(username, callback) {
  selectCommentsByUsername(username, function(result) {
    callback(result[1]);
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
    console.log(result);
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


function deleteSessionByCookie(cookie, callback) {
  var query = 
    "SET @cookie = ?;" + 
    "EXECUTE deleteSessionByCookie USING @cookie;";
  connection.query(query, [cookie], done);

  //callback function
  function done() {
    callback();
  }
}
module.exports.deleteSessionByCookie = deleteSessionByCookie;

function getUserIDFromUsername(username, callback) {
  var query = 
    "SET @username = ?;" +
    "EXECUTE selectUserIDFromUsername USING @username;";
  connection.query(query, [username], done);

  //callback function
  function done(err, result) {
    if(err) throw err;
    if(result[1][0]) {
      callback(result[1][0].userID);
    }
    else {
      callback(null);
    }
  }
}

function deleteSessionByUserID(userID, callback) {
  var query = 
    "SET @userID = ?;" +
    "EXECUTE deleteSessionByUserID USING @userID;";
  connection.query(query, [userID], done);

  //callback function
  function done(err, result) {
    if(err) throw err;
    callback(result);
  }
}

function insertSessionEntry(cookie, userID, callback) {
  var query = 
    "SET @cookie = ?;" + 
    "SET @userID = ?;" + 
    "EXECUTE insertIntoSessions USING @cookie, @userID;";
  connection.query(query, [cookie, userID], done);

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
  var query = 
    "SET @cookie = ?;" +
    "EXECUTE selectUserIDByCookie USING @cookie;";
  connection.query(query, [cookie], done);

  //callback function
  function done(err, result) {
    if(err) throw err;
    if(result[1][0]) {
      callback(result[1][0].userID);
    }
    else {
      callback(null);
    }
  }
}

function getUsernameFromUserID(userID, callback) {
  var query = 
    "SET @userID = ?;" +
    "EXECUTE selectUsernameByUserID USING @userID;";
  connection.query(query, [userID], done);

  //callback function
  function done(err, result) {
    if(err) throw err;
    callback(result[1][0].username);
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



/**********USER DATA******************/



function getUserData(username, callback) {
  var query = 
    "SET @username = ?;" +
    "EXECUTE selectUserData USING @username;"
  connection.query(query, [username], done);

  //callback function
  function done(err, results) {
    if(err) throw err;
    if(results[1][0]) {
      callback(results[1][0]);
    }
    else {
      callback(null);
    }
  }
}
module.exports.getUserData = getUserData;

function getUserImages(username, callback) {
  var query = 
    "SET @username = ?;" +
    "EXECUTE selectImagesByUser USING @username;";
  connection.query(query, [username], done);

  //callback function
  function done(err, results) {
    if(err) throw err;
    callback(results[1]);
  }
}
module.exports.getUserImages = getUserImages;