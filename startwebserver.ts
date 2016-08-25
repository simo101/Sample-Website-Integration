/// <reference path="./typings/tsd.d.ts" />
var connect = require('connect');
var serveStatic = require('serve-static');

connect().use(serveStatic(__dirname)).listen(8000, function () {
    console.log('Server running on 8000...');
});
var openurl = require('openurl').open;
openurl("http://localhost:8000/web/");

