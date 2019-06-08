"use strict";

addEventListener('load', start);

function start() {
  var form = document.querySelector("form");
  var submitButton = document.querySelector("button");
  var loggedIn = document.querySelector("#username") != null;
  submitButton.onclick = function(event) {
    if(loggedIn) {
      if(document.querySelector("textarea").value) {
      	form.submit();
      }
      else {
      	window.alert("You need to add text in order to submit a comment.");
      }
    }
    else {
      window.alert("You need to logged in order to submit a comment.");
    }
  }
}