const https = require("https");
const process = require("process");
const fs = require("fs");
const [eventType = 'default', start = 'false'] = process.argv.slice(2);
const formattedBoolean = start.toLowerCase() === 'true';
const postData = JSON.stringify({ "event": eventType, "key": process.env.EVENT_KEY, "start": formattedBoolean });
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
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
console.log(postData);
const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => responseData += chunk);
  res.on('end', () => console.log('Response:', responseData));
}).on('error', (error) => console.error('Error:', error));
req.write(postData);
req.end();