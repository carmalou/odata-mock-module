#!/usr/bin/env node
'use strict';
var odata = require('n-odata-server/lib/odata');
module.exports = function (loopbackApplication, options) {
    odata.init(loopbackApplication, options);
    odata.OData.singletonInstance = null;
};
