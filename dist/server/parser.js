#!/usr/bin/env node
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var config = require("@varkes/configuration");
var LOGGER = config.logger("odata-mock");
var fs = require("fs");
var parse = require('odata2openapi').parse;
Object.defineProperty(exports, "__esModule", { value: true });
function parseEdmx(path, dataSourceName) {
    return new Promise(function (resolve, reject) {
        fs.readFile(path, "utf8", function (err, data) {
            if (err)
                reject(err);
            parse(data)
                .then(function (service) {
                var result = createEntities(service, dataSourceName);
                resolve(result);
            }).catch(function (error) {
                LOGGER.error("Error while parsing API '%s'", path);
                reject(error);
            });
        });
    });
}
exports.parseEdmx = parseEdmx;
function createEntities(service, dataSourceName) {
    var result = {
        modelConfigs: [],
        modelDefs: []
    };
    service.entityTypes.forEach(function (entityType) {
        var jsonTemplate = JSON.parse(fs.readFileSync(__dirname + "/resources/model_template.json", "utf8"));
        var entityName = entityType.name;
        result.modelConfigs.push({ name: entityName, value: { dataSource: dataSourceName, public: true } });
        jsonTemplate.definition.name = entityName;
        jsonTemplate.definition.plural = entityName + "Set";
        jsonTemplate.definition = createEntityProperties(entityType, jsonTemplate.definition);
        result.modelDefs.push(jsonTemplate);
    });
    return result;
}
function createEntityProperties(entityType, template) {
    template.properties = {};
    entityType.properties.forEach(function (property) {
        template.properties[property.name] = {};
        if (property.required) {
            template.properties[property.name]["required"] = true;
        }
        template.properties[property.name]["type"] = mapType(property.type);
    });
    return template;
}
// https://loopback.io/doc/en/lb3/LoopBack-types.html
// https://openui5.hana.ondemand.com/1.36.0/docs/guide/333a9dac5a614b1590c61916c9cecbf5.html
function mapType(edmType) {
    if (!edmType) {
        return null;
    }
    switch (edmType) {
        case "Edm.Boolean":
            return "Boolean";
        case "Edm.Guid":
            return "String";
        case "Edm.DateTime":
            return "date";
        case "Edm.Decimal":
            return "number";
        case "Edm.Double":
            return "number";
        case "Edm.Int16":
            return "number";
        case "Edm.Int32":
            return "number";
        case "Edm.Int64":
            return "number";
        case "Edm.String":
            return "String";
        default:
            return "any";
    }
}
