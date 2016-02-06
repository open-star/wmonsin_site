/**
 content_controller.ts
 Copyright (c) 2015 7ThCode.
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
 */

'use strict';

declare function require(x:string):any;

var mongoose = require('mongoose');
var _ = require('lodash');

var fs = require('fs');
var text = fs.readFileSync('config/config.json', 'utf-8');
var config = JSON.parse(text);
//config.dbaddress = process.env.DB_PORT_27017_TCP_ADDR || 'localhost';

var ContentModel = require('../../models/content');

var result = require('./../result');
var Wrapper = require('./../wrapper');
var wrapper = new Wrapper;

var log4js = require('log4js');
log4js.configure("config/logs.json");
var logger = log4js.getLogger('request');
logger.setLevel(config.loglevel);

class ContentController {

    constructor() {
    }
/*
    public post_content_accept(req:any, res:any):void {
        logger.trace("begin /content/accept");
        wrapper.Guard(req, res, (req:any, res:any):void => {
            var number:number = 1000;
            var content:any = new ContentModel();

           // article.name = req.body.name;
           // article.title = req.body.title;
           // article.description = req.body.description;
           // article.text = req.body.text;
           // article.tags = [];
           // article.background = "/images/bg.jpg";
           // article.image = "/images/coffee.jpg";
           // article.type = "image";

            wrapper.Save(res, number, content, (res:any, content:any) => {
                wrapper.SendSuccess(res, content);
                logger.trace("end /content/accept");
            });
        });
    }
*/

    public get_content(req:any, res:any):void {
        logger.trace("begin /content");
        wrapper.Guard(req, res, (req:any, res:any) => {
            var number:number = 2000;
            wrapper.Authenticate(req, res, number, (user:any, res:any) => {
                wrapper.FindOne(res, number, ContentModel,{}, (res, content) => {
                    wrapper.SendSuccess(res, content);
                    logger.trace("end /content");
                });
            });
        });
    }

    public put_content(req:any, res:any):void {
        logger.trace("begin /content");
        wrapper.Guard(req, res, (req:any, res:any) => {
            var number:number = 3000;
            wrapper.Authenticate(req, res, number, (user:any, res:any) => {
                wrapper.FindOne(res, number, ContentModel, {}, (res, content) => {
                    content.content = req.body.content;
                    wrapper.Save(res, number, content, (res:any, content:any) => {
                        wrapper.SendSuccess(res, content);
                        logger.trace("end /content");
                    });
                });
            });
        });
    }
/*
    public delete_content(req:any, res:any):void {
        logger.trace("begin /content");
        wrapper.Guard(req, res, (req:any, res:any):void  => {
            var number:number = 4000;
            wrapper.Authenticate(req, res, number, (user:any, res:any):void  => {
                wrapper.If(res, number, (user.type != "Viewer"), (res:any):void  => {
                    wrapper.Remove(res, number, ContentModel, {}, (res:any):void  => {
                        wrapper.SendSuccess(res, {code: 0});
                        logger.trace("end /content");
                    });
                });
            });
        });
    }
*/
}

module.exports = ContentController;