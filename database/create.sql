DROP DATABASE ShareImages;
CREATE DATABASE ShareImages;
USE ShareImages;

CREATE TABLE Users (
  userID INT NOT NULL AUTO_INCREMENT,
  username varchar(20) NOT NULL UNIQUE,
  salt char(128) NOT NULL,
  iterations INT NOT NULL,
  login_key char(128) NOT NULL,
  signupDateTime DATETIME DEFAULT NOW(),
  PRIMARY KEY (userID)
);

CREATE TABLE Sessions (
  sessionID INT NOT NULL AUTO_INCREMENT,
  userID INT NOT NULL,
  cookie VARCHAR(128),
  PRIMARY KEY (sessionID),
  FOREIGN KEY (userID) REFERENCES Users(userID)
);

CREATE TABLE Images (
  imageID INT NOT NULL AUTO_INCREMENT,
  userID INT NOT NULL,
  title VARCHAR(30) NOT NULL,
  path VARCHAR(100) NOT NULL,
  uploadDateTime DATETIME DEFAULT NOW(),
  PRIMARY KEY (imageID),
  FOREIGN KEY (userID) REFERENCES Users(userID)
);


CREATE TABLE Comments (
  commentID INT NOT NULL AUTO_INCREMENT,
  userID INT NOT NULL,
  imageID INT NOT NULL,
  text VARCHAR(100) NOT NULL,
  postDateTime DATETIME DEFAULT NOW(),
  PRIMARY KEY (commentID),
  FOREIGN KEY (userID) REFERENCES Users(userID),
  FOREIGN KEY (imageID) REFERENCES Images(imageID)
);