#!/usr/bin/env node
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var parser = require("./parser");
var config = require("@varkes/configuration");
var loopback = require('loopback');
var boot = require('loopback-boot');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var path = require("path");
var LOGGER = config.logger("odata-mock");
function init(config) {
    return __awaiter(this, void 0, void 0, function () {
        var promises, i, api, resultApp, apps, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    promises = [];
                    for (i = 0; i < config.apis.length; i++) {
                        api = config.apis[i];
                        if (api.type == "odata") {
                            promises.push(bootLoopback(api, config));
                        }
                    }
                    resultApp = express();
                    return [4 /*yield*/, Promise.all(promises)];
                case 1:
                    apps = _a.sent();
                    for (i = 0; i < apps.length; i++) {
                        resultApp.use(apps[i]);
                    }
                    return [2 /*return*/, resultApp];
            }
        });
    });
}
exports.init = init;
function bootLoopback(api, varkesConfig) {
    return __awaiter(this, void 0, void 0, function () {
        var app, bootConfig;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = loopback();
                    app.use(bodyParser.json());
                    app.varkesConfig = varkesConfig;
                    LOGGER.debug("Parsing specification and generating models for api %s", api.name);
                    return [4 /*yield*/, generateBootConfig(api)];
                case 1:
                    bootConfig = _a.sent();
                    LOGGER.debug("Booting loopback middleware for api %s", api.name);
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            boot(app, bootConfig, function (err) {
                                if (err) {
                                    reject(err);
                                }
                                LOGGER.debug("Loopback middleware for api %s is booted", api.name);
                                resolve(app);
                            });
                        })];
            }
        });
    });
}
function generateBootConfig(api) {
    return __awaiter(this, void 0, void 0, function () {
        var dataSourceName, parsedModel, bootConfig, restBasePath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dataSourceName = api.name.replace(/\s/g, '');
                    return [4 /*yield*/, parser.parseEdmx(api.specification, dataSourceName)
                        //for configuration, see https://apidocs.strongloop.com/loopback-boot/
                    ];
                case 1:
                    parsedModel = _a.sent();
                    bootConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, "resources/boot_config_template.json"), "utf-8"));
                    parsedModel.modelConfigs.forEach(function (config) {
                        bootConfig.models[config.name] = config.value;
                    });
                    bootConfig.models["ACL"] = {
                        dataSource: dataSourceName,
                        public: false
                    };
                    parsedModel.modelDefs.forEach(function (definition) {
                        bootConfig.modelDefinitions.push(definition);
                    });
                    bootConfig.appRootDir = __dirname;
                    bootConfig.appConfigRootDir = __dirname;
                    restBasePath = api.basepath.replace("/odata", "/api");
                    bootConfig.components["loopback-component-explorer"] = {
                        mountPath: restBasePath + "/console",
                        basePath: restBasePath
                    };
                    bootConfig.components["./odata-server"] = {
                        path: api.basepath + "/*",
                        odataversion: "2",
                        useViaMiddleware: false
                    };
                    bootConfig.middleware.routes["n-odata-server#odata"].paths = [api.basepath + "/*"];
                    bootConfig.middleware.routes["loopback#rest"].paths = [restBasePath];
                    bootConfig.middleware["initial:before"]["loopback#favicon"].params = path.join(__dirname, "resources/favicon.ico");
                    bootConfig.dataSources[dataSourceName] = {
                        name: dataSourceName,
                        connector: "memory"
                    };
                    if (api.persistence) {
                        if (!fs.existsSync("./data")) {
                            fs.mkdirSync("./data");
                        }
                        bootConfig.dataSources[dataSourceName].file = "data/" + dataSourceName + ".json";
                    }
                    bootConfig.bootScripts = [path.resolve(__dirname, "routes.js")];
                    return [2 /*return*/, bootConfig];
            }
        });
    });
}
