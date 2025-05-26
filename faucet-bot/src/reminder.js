const http = require("http");
const process = require("process");
const postData = JSON.stringify({"event": "reminder", "key": `"${process.env.EVENT_KEY}"`, "start": true})
const options = {
hostname: process.env.EVENT_IP,
port: process.env.EVENT_PORT,
path: '/event',
method: 'POST',
headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
}
}
const req = http.request(options, (res) => {
    console.log (options);
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