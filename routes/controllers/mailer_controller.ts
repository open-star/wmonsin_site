/// <reference path="../../typings/tsd.d.ts" />

'use strict';

declare function require(x:string):any;

var fs:any = require('fs');
var text:any = fs.readFileSync('config/config.json', 'utf-8');
var config:any = JSON.parse(text);
//config.dbaddress = process.env.DB_PORT_27017_TCP_ADDR || 'localhost';

var mailer:any = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var _:_.LoDashStatic = require('lodash');

var Wrapper:any = require('./../wrapper');
var libs:any = require('./../libs');

var wrapper:any = new Wrapper;

interface MailSender {
    from:any;
    to:string;
    subject:string;
    html:string;
}

class Mailer {

    public post_contact(request:any, response:any):void {
  //      wrapper.Guard(request, response, (request:any, response:any):void => {
            var number:number = 80000;
        //    var smtpUser:any = mailer.createTransport('SMTP', config.mailsetting);

            var smtpUser:any = mailer.createTransport(smtpTransport(config.mailsetting));
            if (smtpUser) {
                var resultMail:MailSender = {
                    from: config.mailaccount,
                    to: request.body.email + "," + config.mailaccount,
                    subject: request.body.title,
                    html: "<br/>" +
                    config.inquirymailreader + "<br/>" +
                    "医療機関名: " + request.body.org + " 様<br/>" +
                    "お名前: " + request.body.name + " 様<br/>" +
                    "お問い合わせ: " + request.body.message + "<br/>" +
                    config.inquirymailtrailer + "<br/>"
                };

                try {
                    smtpUser.sendMail(resultMail, (error:any):void => {
                        if (!error) {
                            wrapper.SendSuccess(response, {});
                        } else {
                            wrapper.SendError(response, number + 200, error.message, error);
                        }
                    });
                } finally {
                    smtpUser.close();
                }
            } else {
                wrapper.SendError(response, number + 10, config.mailerror, {});
            }
   //     });
    }



    /*
    public post_contact(request, response):void {
        wrapper.Exception(request, response, (request:any, response:any) => {
            response.jsonp({code: 0, error: request.query.username});
                var number:number = 1000;
                var smtpUser:any = mailer.createTransport('SMTP', config.mailsetting);
                if (smtpUser) {
                    var resultMail:MailSender = {
                        to: config.mailaccount,
                        from: request.body.email,
                        subject: config.inquirymailsubject,
                        html: "<br/>" +
                            config.inquirymailreader +"<br/>" +
                            request.body.name + "<br/>" +
                         //   request.body.subject + "<br/>" +
                            request.body.message + "<br/>" +
                            config.inquirymailtrailer +"<br/>"
                    };

                    smtpUser.sendMail(resultMail, (error:any):void => {
                        if (!error) {
                            response.jsonp({code: 0, error:{}});
                        } else {
                            response.jsonp({code: 1, error:error});
                        }
                        smtpUser.close();
                    });
                } else {
                    response.jsonp({code: 2, error:{}});
                }
        });
    }
*/
    /*
    public post_reserve(request, response):void {
        wrapper.Exception(request, response, (request:any, response:any) => {
            response.jsonp({code: 0, error: request.query.username});
            var number:number = 1000;
            var smtpUser:any = mailer.createTransport('SMTP', config.mailsetting);
            if (smtpUser) {
                var resultMail:MailSender = {
                    from: config.mailaccount,
                    to: request.body.username,
                    subject: config.inquirymailsubject,
                    html: "<br/>" + config.inquirymailreader + "<a href='http://" + config.domain + "/password/'>" + config.inquirymailtrailer + "</a>" + "<br/>"
                };

                smtpUser.sendMail(resultMail, (error:any):void => {
                    if (!error) {
                        response.jsonp({code: 0, error:{}});
                    } else {
                        response.jsonp({code: 1, error:error});
                    }
                    smtpUser.close();
                });
            } else {
                response.jsonp({code: 2, error:{}});
            }
        });
    }
    */

}

module.exports = Mailer;