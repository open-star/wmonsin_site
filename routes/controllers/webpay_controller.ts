/// <reference path="../../typings/tsd.d.ts" />

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

var Wrapper:any = require('./../wrapper');
var libs:any = require('./../libs');

var mailer:any = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var wrapper:any = new Wrapper;

var WebPay = require('webpay');
//var webpay = new WebPay('test_secret_d7D6kh1WPa80c5efDxcVw7q2');
var webpay = new WebPay('test_secret_7f00dSeDs4GL3bl5iM4qV15X');

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

interface Customer {
    amount:number;
    currency:string;
    customer:string;
    period:string;
    description:string
}

interface Token {
    card:string;
    description:string;
    email:string
}


class WebPay_Controller {

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

    static check(err:{data:{error:{causedBy:string}}}, success_callback:() => void, error_callback:(err:any) => void) {
        if (err) {
            if (err instanceof WebPay.errorResponse.ErrorResponseError) {
                var error = err.data.error;
                switch (error.causedBy) {
                    case 'buyer':                           // カードエラーなど、購入者に原因がある エラーメッセージをそのまま表示するのがわかりやすい
                        error_callback(err);
                        break;
                    case 'insufficient':                    // 実装ミスに起因する
                        error_callback(err);
                        break;
                    case 'missing':                         // リクエスト対象のオブジェクトが存在しない
                        error_callback(err);
                        break;
                    case 'service':                         // WebPayに起因するエラー
                        error_callback(err);
                        break;
                    default:                                // 未知のエラー
                        error_callback(err);
                        break;
                }
            } else if (err instanceof WebPay.ApiError) {    // APIからのレスポンスが受け取れない場合。接続エラーなど
                error_callback(err);
            } else {                                        // WebPayとは関係ない例外の場合
                error_callback(err);
            }
        } else {
            success_callback();
        }
    }

    static customer_create(description:{card:string, description:string, email:string}, callback:(error:any, res:any) => void) {
        webpay.customer.create(description, (error:any, res:any) => {
            logger.info(JSON.stringify(res));
            callback(error, res);
        });
    }

    static charge_create(card:{amount: number,currency:string,card:string,description:{}}, callback:(error:any, res:any) => void) {
        webpay.charge.create(card, (error:any, res:any) => {
            logger.info(JSON.stringify(res));
            callback(error, res);
        });
    }

    static recursion_create(customer:{amount:number, currency:string, customer:string, period:string, description:string}, callback:(error:any, res:any) => void):void {
        webpay.recursion.create(customer, (error:any, res:any) => {
            logger.info(JSON.stringify(res));
            callback(error, res);
        });
    }

    static account_retrieve(callback:(error:any, res:any) => void):void {
        webpay.account.retrieve((error:any, res:any) => {
            logger.trace(JSON.stringify(res));
            callback(error, res);
        });
    }

    static account_deleteData(callback:(error:any, res:any) => void):void {
        webpay.account.deleteData((error:any, res:any) => {
            logger.info(JSON.stringify(res));
            callback(error, res);
        });
    }

    static charge_retrieve(id:string, callback:(error:any, res:any) => void):void {
        webpay.charge.retrieve(id, (error:any, res:any) => {
            logger.trace(JSON.stringify(res));
            callback(error, res);
        });
    }

    static charge_refund(id:{id: string}, callback:(error:any, res:any) => void):void {
        webpay.charge.refund(id, (error:any, res:any) => {
            logger.info(JSON.stringify(res));
            callback(error, res);
        });
    }

    static charge_capture(id:{id: string}, callback:(error:any, res:any) => void):void {
        webpay.charge.capture(id, (error:any, res:any) => {
            logger.info(JSON.stringify(res));
            callback(error, res);
        });
    }

    static charge_all(count:{count: string}, callback:(error:any, res:any) => void):void {
        webpay.charge.all(count, (error:any, res:any) => {
            logger.trace(JSON.stringify(res));
            callback(error, res);
        });
    }

    static customer_retrieve(id:string, callback:(error:any, res:any) => void):void {
        webpay.customer.retrieve(id, (error:any, res:any) => {
            logger.trace(JSON.stringify(res));
            callback(error, res);
        });
    }

    static customer_update(description:{id: string, card:string}, callback:(error:any, res:any) => void):void {
        webpay.customer.update(description, (error:any, res:any) => {
            logger.info(JSON.stringify(res));
            callback(error, res);
        });
    }

    static customer_delete(id:{id: string}, callback:(error:any, res:any) => void):void {
        webpay.customer.delete(id, (error:any, res:any) => {
            logger.info(JSON.stringify(res));
            callback(error, res);
        });
    }

    static customer_all(count:{count: string}, callback:(error:any, res:any) => void):void {
        webpay.customer.all(count, (error:any, res:any) => {
            logger.trace(JSON.stringify(res));
            callback(error, res);
        });
    }

    static customer_deleteActiveCard(id:{id:string}, callback:(error:any, res:any) => void):void {
        webpay.customer.deleteActiveCard(id, (error:any, res:any) => {
            logger.info(JSON.stringify(res));
            callback(error, res);
        });
    }

    static token_retrieve(id:string, callback:(error:any, res:any) => void):void {
        webpay.token.retrieve(id, (error:any, res:any) => {
            logger.trace(JSON.stringify(res));
            callback(error, res);
        });
    }

    static recursion_retrieve(id:string, callback:(error:any, res:any) => void):void {
        webpay.recursion.retrieve(id, (error:any, res:any) => {
            logger.trace(JSON.stringify(res));
            callback(error, res);
        });
    }

    static recursion_resume(id:{id:string}, callback:(error:any, res:any) => void):void {
        webpay.recursion.resume(id, (error:any, res:any) => {
            logger.info(JSON.stringify(res));
            callback(error, res);
        });
    }

    static recursion_delete(id:{id:string}, callback:(error:any, res:any) => void):void {
        webpay.recursion.delete(id, (error:any, res:any) => {
            logger.info(JSON.stringify(res));
            callback(error, res);
        });
    }

    static recursion_all(count:{count:number}, callback:(error:any, res:any) => void):void {
        webpay.recursion.all(count, (error:any, res:any) => {
            logger.trace(JSON.stringify(res));
            callback(error, res);
        });
    }

    static event_retrieve(id:string, callback:(error:any, res:any) => void):void {
        webpay.event.retrieve(id, (error:any, res:any) => {
            logger.trace(JSON.stringify(res));
            callback(error, res);
        });
    }

    static event_all(id:string, callback:(error:any, res:any) => void):void {
        webpay.event.all({}, (error:any, res:any) => {
            logger.trace(JSON.stringify(res));
            callback(error, res);
        });
    }

    public post_customer_create(request:any, response:any):void {
        wrapper.Guard(request, response, (request:any, response:any):void => {

            var token:Token = {
                card: request.body.token,
                description: "",
                email: request.body.email
            };

            WebPay_Controller.customer_create(token, (error:any, res:any) => {
                WebPay_Controller.check(error, () => {
                    wrapper.SendSuccess(response, res);
                }, (error:any) => {
                    wrapper.SendError(response, error.status, error.message, error);
                });
            });
        });
    }

    public post_recursion_create(request:any, response:any):void {
        wrapper.Exception(request, response, (request:any, response:any) => {
            wrapper.Guard(request, response, (request:any, response:any):void => {

                var type = request.body.type;

                var data:MailData = {email:request.body.email, agreement:{mail:config.mailaccount, subject:"契約開始", reader:"", trailer:""}, name:""};

                WebPay_Controller.mail(data, () => {

                    var token:Token  = {
                        card: request.body.token,
                        description: "",
                        email: request.body.email
                    };

                    WebPay_Controller.customer_create(token, (error:any, res:any) => {
                        WebPay_Controller.check(error, () => {

                            var customer:Customer = {
                                amount: 500,
                                currency: "jpy",
                                customer: res.id,
                                period: "month",
                                description: ""
                            };

                            WebPay_Controller.recursion_create(customer, (error:any, res:any) => {
                                WebPay_Controller.check(error, () => {
                                    var data:MailData = {email:request.body.email, agreement:{mail:config.mailaccount, subject:"契約完了", reader:"", trailer:""}, name:""};
                                    WebPay_Controller.mail(data, () => {
                                        wrapper.SendSuccess(response, res);
                                    },(error:any) => {
                                        wrapper.SendError(response, error.status, error.message, error);
                                    });
                                }, (error:any) => {
                                    wrapper.SendError(response, error.status, error.message, error);
                                });
                            });
                        }, (error:any) => {
                            wrapper.SendError(response, error.status, error.message, error);
                        });
                    });
                }, (error:any) => {
                    wrapper.SendError(response, error.status, error.message, error);
                });
            });
        });
    }

    public post_charge_create(request:any, response:any):void {
        wrapper.Guard(request, response, (request:any, response:any):void => {

            var token:{amount:number,currency:string,card:string,description:string} = {
                amount: 400,
                currency: "jpy",
                card: request.body.token,
                description: ""
            };

            WebPay_Controller.charge_create(token, (error:any, res:any) => {
                WebPay_Controller.check(error, () => {
                    wrapper.SendSuccess(response, res);
                }, (error:any) => {
                    wrapper.SendError(response, error.status, error.message, error);
                });
            });
        });
    }

}

module.exports = WebPay_Controller;