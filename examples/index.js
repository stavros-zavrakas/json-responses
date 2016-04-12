var express = require('express');

var responses = require('../lib')({
  baseDir: __dirname
});

var app = express();

app.get('/data', function (req, res) {
  responses.sendSuccessResponse(req, res, { hello: 'world' });
});

app.get('/error', function (req, res) {
  responses.sendErrorResponse(req, res, 'ERR_000101');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
