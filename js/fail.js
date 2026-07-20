document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var message = params.get("message");
  var body = document.getElementById("status-body");
  if (message && body) {
    body.textContent = decodeURIComponent(message);
  }
});
