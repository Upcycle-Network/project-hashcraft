const index = require("./index.js");
const wait = new Promise(function(success){
    const ret = index.notify();
if (ret){
success();
}});
wait.finally(function(){process.exit(22)});