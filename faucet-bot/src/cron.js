const index = require("./index.js");
const wait = new Promise(function(){index.notify()}).finally(function(){process.exit(22)});