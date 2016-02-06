/// <reference path="../../typings/tsd.d.ts" />

'use strict';

declare function require(x:string):any;

var fs:any = require('fs');
var text:any = fs.readFileSync('config/config.json', 'utf-8');
var config:any = JSON.parse(text);
//config.dbaddress = process.env.DB_PORT_27017_TCP_ADDR || 'localhost';

var mongoose:any = require('mongoose');

var _:_.LoDashStatic = require('lodash');

var LocalAccount:any = require('../../models/localaccount');

var Wrapper:any = require('./../wrapper');

var wrapper:any = new Wrapper;


class Account {

    public get_account_id(req:any, res:any):void {
        wrapper.Guard(req, res, (req:any, res:any):void => {
            var number:number = 90000;
            wrapper.Authenticate(req, res, number, (selfid:any, self:any, res:any):void => {
                wrapper.If(res, number, (self.type == "Admin"), (res:any):void => {
                    wrapper.FindById(res, number, LocalAccount, req.params.id, (res:any, account:any):void => {
                        wrapper.SendSuccess(res, account);
                    });
                });
            });
        });
    }


    public put_account_id(req:any, res:any):void {
        wrapper.Guard(req, res, (req:any, res:any):void => {
            var number:number = 91000;
            wrapper.Authenticate(req, res, number, (selfid:any, self:any, res:any):void => {
                wrapper.If(res, number, (self.type == "Admin"), (res:any):void => {
                    wrapper.FindById(res, number, LocalAccount, req.params.id, (res:any, account:any):void => {
                        wrapper.Save(res, number, account, (res:any, account:any):void => {
                            wrapper.SendSuccess(res, account);
                        });
                    });
                });
            });
        });
    }

    public delete_account_id(req:any, res:any):void {
        wrapper.Guard(req, res, (req:any, res:any):void => {
            var number:number = 92000;
            wrapper.Authenticate(req, res, number, (selfid:any, self:any, res:any):void => {
                wrapper.If(res, number, (self.type == "Admin"), (res:any):void => {
                    wrapper.Remove(res, number, LocalAccount, req.params.id, (res:any):void => {
                        wrapper.SendSuccess(res, {code: 0});
                    });
                });
            });
        });
    }

    public get_account_query_query(req:any, res:any):void {
        wrapper.Guard(req, res, (req:any, res:any):void => {
            var number:number = 93000;
            wrapper.Authenticate(req, res, number, (selfid:any, self:any, res:any):void => {
                wrapper.If(res, number, (self.type == "Admin"), (res:any):void => {
                    var query:any = JSON.parse(decodeURIComponent(req.params.query));
                    wrapper.Find(res, number, LocalAccount, query, {}, {}, (res:any, docs:any):any => {
                        wrapper.SendSuccessList(res, 0, docs);
                    });
                });
            });
        });
    }

    public get_account_find_username(req:any, res:any):void {
        wrapper.Guard(req, res, (req:any, res:any) => {
            var number:number = 94000;
            wrapper.Authenticate(req, res, number, (selfid:any, self:any, res:any) => {
                var username:string = req.params.username;
                var query:any = {username: username};
                wrapper.FindOne(res, number, LocalAccount, query, (res:any, account:any):any => {
                    wrapper.SendSuccess(res, wrapper.StripAccount(account));
                });
            });
        });
    }
}

module.exports = Account;