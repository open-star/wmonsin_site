/**
 Copyright (c) 2016 7ThCode.
 */
/// <reference path="../typings/main.d.ts" />
'use strict';
var fs = require('fs');
var text = fs.readFileSync('config/config.json', 'utf-8');
var config = JSON.parse(text);
//config.dbaddress = process.env.DB_PORT_27017_TCP_ADDR || 'localhost';
var log4js = require('log4js');
log4js.configure("config/logs.json");
var logger = log4js.getLogger('request');
logger.setLevel(config.loglevel);
var _ = require('lodash');
var result = require('./result');
var Wrapper = (function () {
    function Wrapper() {
    }
    Wrapper.prototype.BasicHeader = function (response, session) {
        response.header("Access-Control-Allow-Origin", "*");
        response.header("Pragma", "no-cache");
        response.header("Cache-Control", "no-cache");
        response.contentType('application/json');
        return response;
    };
    Wrapper.prototype.Exception = function (req, res, callback) {
        try {
            callback(req, res);
        }
        catch (e) {
            this.SendFatal(res, 100000, e.message, e);
        }
    };
    Wrapper.prototype.Guard = function (req, res, callback) {
        if (req.headers["x-requested-with"] === 'XMLHttpRequest') {
            logger.trace("|enter Guard ");
            res = this.BasicHeader(res, "");
            callback(req, res);
            logger.trace("|exit Guard ");
        }
        else {
            this.SendWarn(res, 1, 'CSRF Attack.', {});
        }
    };
    Wrapper.prototype.Authenticate = function (req, res, code, callback) {
        if (req.isAuthenticated()) {
            var id = "";
            switch (req.user.provider) {
                case 'local':
                    id = req.user.userid;
                    break;
                case 'facebook':
                    id = req.user.id;
                    break;
                default:
            }
            callback(id, req.user, res);
        }
        else {
            this.SendError(res, code + 2, "Unacceptable", {});
        }
    };
    Wrapper.prototype.FindById = function (res, code, model, id, callback) {
        var _this = this;
        model.findById(id, function (error, object) {
            if (!error) {
                if (object) {
                    callback(res, object);
                }
                else {
                    _this.SendError(res, code + 10, "", {});
                }
            }
            else {
                _this.SendError(res, code + 100, "", error);
            }
        });
    };
    Wrapper.prototype.FindOne = function (res, code, model, query, callback) {
        var _this = this;
        model.findOne(query, function (error, doc) {
            if (!error) {
                callback(res, doc);
            }
            else {
                _this.SendError(res, code + 100, "", error);
            }
        });
    };
    Wrapper.prototype.Find = function (res, code, model, query, count, sort, callback) {
        var _this = this;
        model.find(query, count, sort, function (error, docs) {
            if (!error) {
                if (docs) {
                    callback(res, docs);
                }
                else {
                    _this.SendError(res, code + 10, "", {});
                }
            }
            else {
                _this.SendError(res, code + 100, "", error);
            }
        });
    };
    Wrapper.prototype.FindAndModify = function (res, code, model, query, sort, update, options, callback) {
        var _this = this;
        model.findAndModify(query, sort, update, options, function (error, docs) {
            if (!error) {
                if (docs) {
                    callback(res, docs);
                }
                else {
                    _this.SendError(res, code + 10, "", {});
                }
            }
            else {
                _this.SendError(res, code + 100, "", error);
            }
        });
    };
    Wrapper.prototype.Save = function (res, code, instance, callback) {
        var _this = this;
        instance.save(function (error) {
            if (!error) {
                callback(res, instance);
            }
            else {
                _this.SendError(res, code + 100, "", error);
            }
        });
    };
    Wrapper.prototype.Update = function (res, code, model, query, update, callback) {
        var _this = this;
        model.update(query, update, { multi: true }, function (error) {
            if (!error) {
                callback();
            }
            else {
                _this.SendError(res, code + 100, "", error);
            }
        });
    };
    Wrapper.prototype.Remove = function (res, code, model, id, callback) {
        var _this = this;
        model.remove({ _id: id }, function (error) {
            if (!error) {
                callback(res);
            }
            else {
                _this.SendError(res, code + 100, "", error);
            }
        });
    };
    Wrapper.prototype.If = function (res, code, condition, callback) {
        if (condition) {
            callback(res);
        }
        else {
            this.SendWarn(res, code + 1, "", {});
        }
    };
    Wrapper.prototype.SendWarn = function (res, code, message, object) {
        logger.warn(message + " " + code);
        res.send(JSON.stringify(new result(code, object)));
    };
    Wrapper.prototype.SendError = function (res, code, message, object) {
        logger.error(message + " " + code);
        res.send(JSON.stringify(new result(code, object)));
    };
    Wrapper.prototype.SendFatal = function (res, code, message, object) {
        logger.fatal(message + " " + code);
        res.send(JSON.stringify(new result(code, object)));
    };
    Wrapper.prototype.SendSuccess = function (res, object) {
        res.send(JSON.stringify(object));
    };
    Wrapper.prototype.SendSuccessList = function (res, code, object) {
        res.send(JSON.stringify(new result(code, object)));
    };
    Wrapper.prototype.StripAccount = function (account) {
        account._id = null;
        account.hash = null;
        account.salt = null;
        return account;
    };
    Wrapper.prototype.StripAccounts = function (accounts) {
        var _this = this;
        var result = [];
        _.each(accounts, function (member) {
            result.push(_this.StripAccount(member));
        });
        return result;
    };
    return Wrapper;
}());
module.exports = Wrapper;
//# sourceMappingURL=wrapper.js.map