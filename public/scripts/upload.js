"use strict";

addEventListener('load', start);

function start() {
  var form = document.querySelector("form");
  var submitButton = document.querySelector("button");
  var loggedIn = document.querySelector("#username") != null;
  submitButton.onclick = function(event) {
    if(loggedIn) {
      form.submit();
    }
    else {
      window.alert("You need to be logged in to upload an image.");
    }
  }
}