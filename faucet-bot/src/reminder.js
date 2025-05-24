const http = require("http");
const process = require("process");
require('dotenv').config({ path: require('find-config')('.env') });
const postData = JSON.stringify({"event": "reminder", "start": true})
const options = {
hostname: process.ENV.EVENT_IP,
port: 8080,
path: '/event',
method: 'POST',
headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
}
}
const req = http.request(options).on("error", (err) => {console.log("Error: " + err.message);});
req.write(postData);
req.end();