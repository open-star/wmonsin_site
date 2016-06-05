/**
 Copyright (c) 2016 7ThCode.
 */

/// <reference path="../../typings/main.d.ts" />

'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');

const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config/config.json', 'utf-8'));
//config.dbaddress = process.env.DB_PORT_27017_TCP_ADDR || 'localhost';

const ArticleModel = require('../../models/article');

const result = require('./../result');
const Wrapper = require('./../wrapper');
const wrapper = new Wrapper;

const log4js = require('log4js');
log4js.configure("config/logs.json");
const logger = log4js.getLogger('request');
logger.setLevel(config.loglevel);

class ArticleController {

    constructor() {
    }

    public post_article_accept(req:any, res:any):void {
        logger.trace("begin /article/accept");
        wrapper.Guard(req, res, (req:any, res:any):void => {
            let number:number = 1000;
            let article:any = new ArticleModel();

            article.title = req.body.title;
            article.description = req.body.description;
            article.text = req.body.text;

            article.category = "news";
            article.tag = "";

            article.image = req.body.image;

            wrapper.Save(res, number, article, (res:any, article:any) => {
                wrapper.SendSuccess(res, article);
                logger.trace("end /article/accept");
            });
        });
    }

    public get_article_id(req:any, res:any):void {
        logger.trace("begin /article/:id");
        wrapper.Guard(req, res, (req:any, res:any) => {
            let number:number = 2000;
            wrapper.Authenticate(req, res, number, (selfid:any, user:any, res:any):void => {
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
            let number:number = 3000;
            wrapper.Authenticate(req, res, number, (selfid:any,user:any, res:any):void => {
                wrapper.FindById(res, number, ArticleModel, req.params.id, (res, article) => {
                    article.title = req.body.title;
                    article.description = req.body.description;
                    article.text = req.body.text;

                    article.category = "news";
                    article.tag = "";

                    article.image = req.body.image;
                    article.publish = req.body.publish;
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
            let number:number = 4000;
            wrapper.Authenticate(req, res, number, (selfid:any,user:any, res:any):void  => {
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
            let number:number = 5000;
            wrapper.Authenticate(req, res, number, (selfid:any, user:any, res:any):void  => {
                let query = JSON.parse(decodeURIComponent(req.params.query));
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
            let number:number = 6000;
            wrapper.Authenticate(req, res, number, (selfid:any, user:any, res:any):void  => {
                let query = JSON.parse(decodeURIComponent(req.params.query));
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
