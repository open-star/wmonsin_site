/// <reference path="../../typings/tsd.d.ts" />
'use strict';
var fs = require('fs');
var text = fs.readFileSync('config/config.json', 'utf-8');
var config = JSON.parse(text);
//config.dbaddress = process.env.DB_PORT_27017_TCP_ADDR || 'localhost';
var mailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var _ = require('lodash');
var Wrapper = require('./../wrapper');
var libs = require('./../libs');
var wrapper = new Wrapper;
var Mailer = (function () {
    function Mailer() {
    }
    Mailer.prototype.post_contact = function (request, response) {
        //      wrapper.Guard(request, response, (request:any, response:any):void => {
        var number = 80000;
        //    var smtpUser:any = mailer.createTransport('SMTP', config.mailsetting);
        var smtpUser = mailer.createTransport(smtpTransport(config.mailsetting));
        if (smtpUser) {
            var resultMail = {
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
                smtpUser.sendMail(resultMail, function (error) {
                    if (!error) {
                        wrapper.SendSuccess(response, {});
                    }
                    else {
                        wrapper.SendError(response, number + 200, error.message, error);
                    }
                });
            }
            finally {
                smtpUser.close();
            }
        }
        else {
            wrapper.SendError(response, number + 10, config.mailerror, {});
        }
        //     });
    };
    return Mailer;
}());
module.exports = Mailer;
//# sourceMappingURL=mailer_controller.js.map