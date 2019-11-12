#!/usr/bin/env node
'use strict';
var bodyParser = require('body-parser');
var morgan = require('morgan');
var fs = require('fs');
module.exports = function (app) {
    registerLogger(app);
    var apis = app.varkesConfig.apis;
    function registerLogger(app) {
        morgan.token('header', function (req, res) {
            if (req.rawHeaders && Object.keys(req.rawHeaders).length != 0)
                return req.rawHeaders;
            else
                return "-";
        });
        morgan.token('body', function (req, res) {
            if (req.body && Object.keys(req.body).length != 0)
                return JSON.stringify(req.body);
            else
                return "-";
        });
        var logging_string = '[:date[clf]], User: :remote-user, ":method :url, Status: :status"\n Header:\n :header\n Body:\n :body';
        var requestLogStream = fs.createWriteStream('requests.log', { flags: 'a' });
        app.use(morgan(logging_string, { stream: requestLogStream }), morgan(logging_string));
    }
    app.use(bodyParser.json());
};
