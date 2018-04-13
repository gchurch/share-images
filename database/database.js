"use strict";

const mysql = require('mysql');
const fs = require('fs');
const crypto = require('crypto');

const connection = mysql.createConnection({
  multipleStatements: true,
  host: "localhost",
  user: "root",
  password: "password",
  database: "ShareImages"
});

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
  "PREPARE checkUsernameExists FROM 'SELECT username FROM Users WHERE username = ? LIMIT 1;';" +
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

/*************IMAGE DATA FUNCTIONS************/



function getLatestImages(callback) {
  var query = 
    "SET @imageLimit = ?;" + 
    "EXECUTE selectLatestImages USING @imageLimit;";
  connection.query(query, [imageLimit], done);

  //callback function
  function done(err, result) {
    if (err) throw err;
    callback(result[1]);
  };
}
module.exports.getLatestImages = getLatestImages;

//callback function recieves all of the image data in the database
function getAllImages(callback) {
  var query = 
    "EXECUTE selectAllImages;";
  connection.query(query, done);

  //callback function
  function done(err, result) {
    if (err) throw err;
    callback(result);
  }
}
module.exports.getAllImages = getAllImages;

function insertImageEntry(userID, title, path, callback) {
  var query = 
    "SET @userID = ?;" + 
    "SET @title = ?;" +
    "SET @path = ?;" + 
    "EXECUTE insertIntoImages USING @userID, @title, @path;";
  connection.query(query, [userID, title, path], done);

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
function getImageDataById(imageID, callback) {
  var query = 
    "SET @imageID = ?;" +
    "EXECUTE selectImageByImageID USING @imageID;";
  connection.query(query, [imageID], done);

  //callback function
  function done(err, result) {
    if (err) throw err;
    callback(result[1]);
  };
}
module.exports.getImageDataById = getImageDataById;



/*************COMMENTS*******************/



function getCommentsByImageID(imageID, callback) {
  var query = 
    "SET @imageID = ?;" +
    "EXECUTE selectCommentsByImageID USING @imageID;"
  connection.query(query, [imageID], done);

  //callback function
  function done(err, result) {
    if (err) throw err;
    callback(result[1]);
  };
}
module.exports.getCommentsByImageID = getCommentsByImageID;

function insertCommentEntry(userID, imageID, text, callback) {
  var query = 
    "SET @userID = ?;" + 
    "SET @imageID = ?;" + 
    "SET @text = ?;" + 
    "EXECUTE insertIntoComments USING @userID, @imageID, @text;";
  connection.query(query, [userID, imageID, text], done);

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

function getUserComments(username, callback) {
  var query = 
    "SET @username = ?;" +
    "EXECUTE selectCommentsByUsername USING @username;"
  connection.query(query, [username], done);

  //callback function
  function done(err, results) {
    if(err) throw err;
    callback(results[1]);
  }
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



function createAccount(username, password, callback) {
  var salt = randomData();
  var iterations = 100000;
  var login_key = saltHashAndStretch(password, salt, iterations);
  var query = 
    "SET @username = ?;" + 
    "SET @salt = ?;" + 
    "SET @iterations = ?;" + 
    "SET @login_key = ?;" + 
    "EXECUTE insertIntoUsers USING @username, @salt, @iterations, @login_key;";
  connection.query(query, [username, salt, iterations, login_key], done);

  //callback function
  function done(err) {
    if (err) throw err;
    callback();
  };
}
module.exports.createAccount = createAccount;

function checkUsernameAlreadyExists(username, callback) {
  var query = 
    "SET @username = ?;" + 
    "EXECUTE checkUsernameExists USING @username;";
  connection.query(query, [username], done);

  //callback function
  function done(err, result, fields) {
    if(err) throw err;
    if(result[1][0]) {
      callback(true);
    } else {
      callback(false);
    }
  };
}
module.exports.checkUsernameAlreadyExists = checkUsernameAlreadyExists;



/**************LOGIN FUNCTIONS*****************/



function checkLoginDetails(username, password, callback) {
  var query = 
    "SET @username = ?;" +
    "EXECUTE selectLoginInfo USING @username;";
  connection.query(query, [username], done);

  //callback function
  function done(err, result, fields) {
    if(err) throw err;
    //check the password matches
    if(result[1][0]) {
      if(saltHashAndStretch(password, result[1][0].salt, result[1][0].iterations) == result[1][0].login_key) {
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