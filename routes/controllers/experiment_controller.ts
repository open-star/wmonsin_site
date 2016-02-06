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

var ExperimentModel = require('../../models/experiment');

var result = require('./../result');
var Wrapper = require('./../wrapper');
var wrapper = new Wrapper;

var log4js = require('log4js');
log4js.configure("config/logs.json");
var logger = log4js.getLogger('request');
logger.setLevel(config.loglevel);

var mailer:any = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

interface MailSender {
    from:any;
    to:string;
    subject:string;
    html:string;
}

interface MailData {
    email:string;
    agreement:
        {
            mail:string;
            subject:string;
            reader:string;
            trailer:string;
        },
    name:string
}

class ExperimentController {

    constructor() {
    }


    static mail(data:{email:string, agreement:{mail:string, subject:string, reader:string, trailer:string}, name:string}, success_callback:() => void, error_callback:(err:any) => void) {
        var smtpUser:any = mailer.createTransport(smtpTransport(config.mailsetting));
        if (smtpUser) {
            var resultMail:MailSender = {
                from: data.agreement.mail,
                to: data.email + "," + data.agreement.mail,
                subject: data.agreement.subject,
                html: "<br/>" +
                data.agreement.reader + "<br/>" +
                data.name + "<br/>" +
                "<br/>" +
                data.agreement.trailer + "<br/>"
            };

            try {
                smtpUser.sendMail(resultMail, (error:any):void => {
                    if (!error) {
                        success_callback();
                    } else {
                        error_callback(error);
                    }
                });
            } finally {
                smtpUser.close();
            }
        } else {
            error_callback({});
        }
    }

    public post_experiment_create(req:any, res:any):void {
        logger.trace("begin /experiment/create");
        wrapper.Guard(req, res, (req:any, res:any):void => {
            var number:number = 1000;
            var experiment:any = new ExperimentModel();
            experiment.email = req.body.email;
            experiment.name = req.body.name;
            wrapper.Save(res, number, experiment, (res:any, article:any) => {
                var data:MailData = {email:req.body.email, agreement:{mail:config.mailaccount, subject:"試用申し込み完了", reader:"", trailer:""}, name:""};
                ExperimentController.mail(data, () => {
                    wrapper.SendSuccess(res, article);
                    logger.trace("end /experiment/create");
                },(error:any) => {
                    wrapper.SendError(res, error.status, error.message, error);
                });

            });
        });
    }

    public get_experiment_query_query(req:any, res:any):void {
        logger.trace("begin /experiment/query/:query");
        wrapper.Guard(req, res, (req:any, res:any):void  => {
            var number:number = 5000;
            wrapper.Authenticate(req, res, number, (id:any, user:any, res:any):void  => {
                var query = JSON.parse(decodeURIComponent(req.params.query));
                wrapper.Find(res, number, ExperimentModel, {}, {}, {sort: {date: -1}}, (res:any, docs:any):void  => {
                    wrapper.SendSuccessList(res, 0, docs);
                    logger.trace("end /experiment/query/:query");
                });
            });
        });
    }

}

module.exports = ExperimentController;