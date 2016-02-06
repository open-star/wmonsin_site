/**
 article_controller.ts
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

var ArticleModel = require('../../models/article');

var result = require('./../result');
var Wrapper = require('./../wrapper');
var wrapper = new Wrapper;

var log4js = require('log4js');
log4js.configure("config/logs.json");
var logger = log4js.getLogger('request');
logger.setLevel(config.loglevel);

class ArticleController {

    constructor() {
    }

    public post_article_accept(req:any, res:any):void {
        logger.trace("begin /article/accept");
        wrapper.Guard(req, res, (req:any, res:any):void => {
            var number:number = 1000;
            //同時に同名でないこと（自動Accept対策)
            //   var query = {"$and": [{'Information.name': req.body.Information.name}, {'Information.time': req.body.Information.time}]};
            //   wrapper.Find(res, number, ArticleModel, {}, {}, {}, (res:any, docs:any) => {
            //   if (docs.length === 0) {
            var article:any = new ArticleModel();

            article.name = req.body.name;
            article.title = req.body.title;
            article.description = req.body.description;
            article.text = req.body.text;
            article.tags = [];
            article.background = "/images/bg.jpg";
            article.image = "/images/coffee.jpg";
            article.type = "image";

            wrapper.Save(res, number, article, (res:any, article:any) => {
                wrapper.SendSuccess(res, article);
                logger.trace("end /article/accept");
            });
        });
    }

    public get_article_id(req:any, res:any):void {
        logger.trace("begin /article/:id");
        wrapper.Guard(req, res, (req:any, res:any) => {
            var number:number = 2000;
            wrapper.Authenticate(req, res, number, (user:any, res:any) => {
                wrapper.FindById(res, number, ArticleModel, req.params.id, (res, article) => {
                    wrapper.SendSuccess(res, article);
                    logger.trace("end /article/:id");
                });
            });
        });
    }

    public put_article_id(req:any, res:any):void {
        logger.trace("begin /article/:id");
        wrapper.Guard(req, res, (req:any, res:any) => {
            var number:number = 3000;
            wrapper.Authenticate(req, res, number, (user:any, res:any) => {
                wrapper.FindById(res, number, ArticleModel, req.params.id, (res, article) => {
                    article.name = req.body.name;
                    article.title = req.body.title;
                    article.description = req.body.description;
                    article.text = req.body.text;
                    //article.tags = req.body.tags;
                    article.background = "/images/bg.jpg";
                    article.image = "/images/coffee.jpg";
                    article.type = "image";
                    wrapper.Save(res, number, article, (res:any, article:any) => {
                        wrapper.SendSuccess(res, article);
                        logger.trace("end /article/:id");
                    });
                });
            });
        });
    }

    public delete_article_id(req:any, res:any):void {
        logger.trace("begin /article/:id");
        wrapper.Guard(req, res, (req:any, res:any):void  => {
            var number:number = 4000;
            wrapper.Authenticate(req, res, number, (user:any, res:any):void  => {
                wrapper.If(res, number, (user.type != "Viewer"), (res:any):void  => {
                    wrapper.Remove(res, number, ArticleModel, req.params.id, (res:any):void  => {
                        wrapper.SendSuccess(res, {code: 0});
                        logger.trace("end /article/:id");
                    });
                });
            });
        });
    }

    public get_article_query_query(req:any, res:any):void {
        logger.trace("begin /article/query/:query");
        wrapper.Guard(req, res, (req:any, res:any):void  => {
            var number:number = 5000;
            wrapper.Authenticate(req, res, number, (user:any, res:any):void  => {
                var query = JSON.parse(decodeURIComponent(req.params.query));
                wrapper.Find(res, number, ArticleModel, query, {}, {sort: {date: -1}}, (res:any, docs:any):void  => {
                    wrapper.SendSuccessList(res, 0, docs);
                    logger.trace("end /article/query/:query");
                });
            });
        });
    }

    public get_article_count_query(req:any, res:any):void {
        logger.trace("begin /article/count/:query");
        wrapper.Guard(req, res, (req:any, res:any):void  => {
            var number:number = 6000;
            wrapper.Authenticate(req, res, number, (user:any, res:any):void  => {
                var query = JSON.parse(decodeURIComponent(req.params.query));
                ArticleModel.count(query, (error:any, docs:any):void => {
                    if (!error) {
                        if (docs) {
                            wrapper.SendSuccessList(res, 0, docs);
                            logger.trace("end /article/count/:query");
                        }
                    } else {
                        wrapper.SendError(res, number + 100, error.message, error);
                    }
                });
            });
        });
    }

}

module.exports = ArticleController;