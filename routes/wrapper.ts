/// <reference path="../typings/tsd.d.ts" />

'use strict';

declare function require(x:string):any;

var fs:any = require('fs');
var text:any = fs.readFileSync('config/config.json', 'utf-8');
var config:any = JSON.parse(text);
//config.dbaddress = process.env.DB_PORT_27017_TCP_ADDR || 'localhost';

var log4js:any = require('log4js');
log4js.configure("config/logs.json");
var logger:any = log4js.getLogger('request');
logger.setLevel(config.loglevel);

var _:_.LoDashStatic = require('lodash');

var result:any = require('./result');

class Wrapper {

    public BasicHeader(response:any, session:any):any {
        response.header("Access-Control-Allow-Origin", "*");
        response.header("Pragma", "no-cache");
        response.header("Cache-Control", "no-cache");
        response.contentType('application/json');
        return response;
    }

    public Exception(req:any, res:any, callback:(req:any, res:any) => void):void {
        try {
            callback(req, res);
        } catch (e) {
            this.SendFatal(res, 100000, e.message, e);
        }
    }

    public Guard(req:any, res:any, callback:(req:any, res:any) => void):void {
        if (req.headers["x-requested-with"] === 'XMLHttpRequest') {
            logger.trace("|enter Guard ");
            res = this.BasicHeader(res, "");
            callback(req, res);
            logger.trace("|exit Guard ");
        } else {
            this.SendWarn(res, 1, 'CSRF Attack.', {});
        }
    }

    public Authenticate(req:any, res:any, code:number, callback:(selfid:any, account:any, res:any) => void):void {
        if (req.isAuthenticated()) {
            var id:string = "";
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
        } else {
            this.SendError(res, code + 2, "Unacceptable", {});
        }
    }

    public FindById(res:any, code:number, model:any, id:any, callback:(res:any, object:any) => void):void {
        model.findById(id, (error:any, object:any):void => {
            if (!error) {
                if (object) {
                    callback(res, object);
                } else {
                    this.SendError(res, code + 10, "", {});
                }
            } else {
                this.SendError(res, code + 100, "", error);
            }
        });
    }

    public FindOne(res:any, code:number, model:any, query:any, callback:(res:any, object:any) => void):void {
        model.findOne(query, (error:any, doc:any):void => {
            if (!error) {
                callback(res, doc);
            } else {
                this.SendError(res, code + 100, "", error);
            }
        });
    }

    public Find(res:any, code:number, model:any, query:any, count:any, sort:any, callback:(res:any, object:any) => void):void {
        model.find(query, count, sort, (error:any, docs:any):void => {
            if (!error) {
                if (docs) {
                    callback(res, docs);
                } else {
                    this.SendError(res, code + 10, "", {});
                }
            } else {
                this.SendError(res, code + 100, "", error);
            }
        });
    }

    public FindAndModify(res:any, code:number, model:any, query:any, sort:any, update:any, options:any, callback:(res:any, object:any) => void):void {
        model.findAndModify(query, sort, update, options, (error:any, docs:any):void => {
            if (!error) {
                if (docs) {
                    callback(res, docs);
                } else {
                    this.SendError(res, code + 10, "", {});
                }
            } else {
                this.SendError(res, code + 100, "", error);
            }
        });
    }

    public Save(res:any, code:number, instance:any, callback:(res:any, object:any) => void):void {
        instance.save((error:any):void => {
            if (!error) {
                callback(res, instance);
            } else {
                this.SendError(res, code + 100, "", error);
            }
        });
    }

    public Update(res:any, code:number, model:any, query:any, update:any, callback:() => void):void {
        model.update(query, update, {multi: true}, (error:any):void => {
            if (!error) {
                callback();
            } else {
                this.SendError(res, code + 100, "", error);
            }
        });
    }

    public Remove(res:any, code:number, model:any, id:any, callback:(res:any) => void):void {
        model.remove({_id: id}, (error:any):void => {
            if (!error) {
                callback(res);
            } else {
                this.SendError(res, code + 100, "", error);
            }
        });
    }

    public If(res:any, code:number, condition:boolean, callback:(res:any) => void):void {
        if (condition) {
            callback(res);
        } else {
            this.SendWarn(res, code + 1, "", {});
        }
    }

    public SendWarn(res:any, code:number, message:any, object:any):void {
        logger.warn(message + " " + code);
        res.send(JSON.stringify(new result(code, object)));
    }

    public SendError(res:any, code:number, message:any, object:any):void {
        logger.error(message + " " + code);
        res.send(JSON.stringify(new result(code, object)));
    }

    public SendFatal(res:any, code:number, message:any, object:any):void {
        logger.fatal(message + " " + code);
        res.send(JSON.stringify(new result(code, object)));
    }

    public SendSuccess(res:any, object:any):void {
        res.send(JSON.stringify(new result(0, object)));
    }

    public SendSuccessList(res:any, code:number, object:any):void {
        res.send(JSON.stringify(new result(code, object)));
    }

    public StripAccount(account:any):any {
        account._id = null;
        account.hash = null;
        account.salt = null;
        return account;
    }

    public StripAccounts(accounts:any):any[] {
        var result:any[] = [];
        _.each(accounts, (member:any):void => {
            result.push(this.StripAccount(member));
        });
        return result;
    }

}

module.exports = Wrapper;



