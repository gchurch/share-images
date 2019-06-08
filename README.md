# ShareImages website

## Description

This website allows users to share images with each other. A user must be signed up and logged in before they can upload an image. Users can also place comments on uploaded images.

- The web server is run using [Node.js](https://nodejs.org/en/) and the [Express](https://expressjs.com/) web framework.
- The [mustache](https://github.com/janl/mustache.js) template system is used to render the html.
- The [multer](https://github.com/expressjs/multer) middleware is used to upload files to the web server.
- [sqlite3](https://github.com/mapbox/node-sqlite3) is used for the database.

User passwords are salted, hashed and stretched for security purposes.

## Running the webserver (Linux)

First, install all of the required node packages using the command:

```
$ npm install
```

Next, run the web server with the command:

```
$ DEBUG=myapp:* npm start
```

Finally, visit the website at the url http://localhost:8080/


![Screenshot](./screenshot.png "screenshot")
