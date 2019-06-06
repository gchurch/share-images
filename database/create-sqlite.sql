DROP TABLE Users;
CREATE TABLE Users (
  userID INT NOT NULL PRIMARY KEY,
  username varchar(20) NOT NULL UNIQUE,
  salt char(128) NOT NULL,
  iterations INT NOT NULL,
  login_key char(128) NOT NULL,
  signupDateTime DATETIME default current_timestamp
);

DROP TABLE Sessions;
CREATE TABLE Sessions (
  sessionID INT NOT NULL PRIMARY KEY,
  userID INT NOT NULL,
  cookie VARCHAR(128) NOT NULL,
  FOREIGN KEY (userID) REFERENCES Users(userID)
);

DROP TABLE Images;
CREATE TABLE Images (
  imageID INT NOT NULL PRIMARY KEY,
  userID INT NOT NULL,
  title VARCHAR(30) NOT NULL,
  path VARCHAR(100) NOT NULL,
  uploadDateTime DATETIME DEFAULT current_timestamp,
  FOREIGN KEY (userID) REFERENCES Users(userID)
);

DROP TABLE Comments;
CREATE TABLE Comments (
  commentID INT NOT NULL PRIMARY KEY,
  userID INT NOT NULL,
  imageID INT NOT NULL,
  text VARCHAR(100) NOT NULL,
  postDateTime DATETIME DEFAULT current_timestamp,
  FOREIGN KEY (userID) REFERENCES Users(userID),
  FOREIGN KEY (imageID) REFERENCES Images(imageID)
);