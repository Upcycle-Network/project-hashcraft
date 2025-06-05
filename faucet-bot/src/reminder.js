const https = require("https");
const process = require("process");
const fs = require ("fs");
const postData = JSON.stringify({"type": "event", "event": "reminder", "key": `${process.env.EVENT_KEY}`, "start": true})
const options = {
hostname: process.env.EVENT_IP,
port: process.env.EVENT_PORT,
key: fs.readFileSync('./src/server.key'),
cert: fs.readFileSync('./src/server.cer'),
path: '/',
method: 'POST',
headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
}
}
process.env.NODE_TLS_REJECT_UNAUTHORIZED=0;
const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  res.on('end', () => {
    console.log('Response:', responseData);
  });
});
req.on('error', (error) => {
  console.error('Error:', error);
});
req.write(postData);
req.end();