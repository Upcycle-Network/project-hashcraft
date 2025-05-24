const index = require("./index.js");
const wait = new Promise(index.notify()).finally(process.exit(22));