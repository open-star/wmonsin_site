/// <reference path="../../typings/tsd.d.ts" />

'use strict';

declare function require(x:string):any;

var fs:any = require('fs');
var text:any = fs.readFileSync('config/config.json', 'utf-8');
var config:any = JSON.parse(text);
//config.dbaddress = process.env.DB_PORT_27017_TCP_ADDR || 'localhost';

var mongoose:any = require('mongoose');
var passport:any = require('passport');
var mailer:any = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var _:_.LoDashStatic = require('lodash');

var LocalAccount:any = require('../../models/localaccount');

var Wrapper:any = require('./../wrapper');
var libs:any = require('./../libs');

var wrapper:any = new Wrapper;

interface Token {
    username:string;
    password:string;
    timestamp:any;
}

interface MailSender {
    from:any;
    to:string;
    subject:string;
    html:string;
}

class Auth {

    public post_local_register(request:any, response:any):void {
        wrapper.Exception(request, response, (request:any, response:any) => {
            wrapper.Guard(request, response, (request:any, response:any):void => {
                var number:number = 80000;
                wrapper.FindOne(response, 100, LocalAccount, {$and: [{provider: "local"}, {username: request.body.username}]},
                    (response:any, account:any):void => {
                        if (!account) {

                            var smtpUser:any = mailer.createTransport(smtpTransport(config.mailsetting));
                            if (smtpUser) {
                                var tokenValue:Token = {
                                    username: request.body.username,
                                    password: request.body.password,
                                    timestamp: Date.now()
                                };

                                var tokenValueString:string = JSON.stringify(tokenValue);
                                var token:string = libs.Cipher(tokenValueString, config.tokensecret);
                                var resultMail:MailSender = {
                                    from: config.mailaccount,
                                    to: request.body.username,
                                    subject: config.registmailsubject,
                                    html: "<br/>" + config.registmailreader + "<a href='http://" + config.domain + "/register/" + token + "'>" + config.maillink + "</a>" + config.registmailtrailer + "</a>" + "<br/>"
                                };

                                smtpUser.sendMail(resultMail, (error:any):void => {
                                    if (!error) {
                                        wrapper.SendSuccess(response, {code:0});
                                    } else {
                                        wrapper.SendError(response, number + 200, error.message, error);
                                    }
                                    smtpUser.close();
                                });
                            } else {
                                wrapper.SendError(response, number + 10, config.mailerror, {});
                            }
                        } else {
                            wrapper.SendWarn(response, number + 1, config.usernamealreadyregist, {});
                        }
                    }
                );
            });
        });
    }

    public get_register_token(request, response):void {
        var encryptToken:string = request.params.token;
        try {
            var decryptToken:string = libs.DeCipher(encryptToken, config.tokensecret);
            var token:{timestamp:any;username:string;password:string} = JSON.parse(decryptToken);
        } catch (e) {}
        var tokenDateTime:any = token.timestamp;
        var nowDate:any = Date.now();
        if ((tokenDateTime - nowDate) < (60 * 60 * 1000)) {
            LocalAccount.findOne({username: token.username}, (error:any, account_data:any):void => {
                if (!error) {
                    if (!account_data) {
                        wrapper.FindOne(response, 81000, LocalAccount, {type: "Admin"}, (response:any, admin:any) => {
                            if (admin) {
                                var objectid:any = new mongoose.Types.ObjectId; // Create new id
                                var userid:string = objectid.toString();
                                LocalAccount.register(new LocalAccount({
                                        username: token.username,
                                        userid: userid,
                                        mail: token.username,
                                        description: {
                                            open: {
                                                name: token.username
                                            },
                                            closed: {
                                                gender: "",
                                                age: 0,
                                                address: ""
                                            }
                                        }
                                    }),
                                    token.password,
                                    (error:any):void => {
                                        if (!error) {

                                            //い…いや…　体験したというよりは　まったく理解を　超えていたのだが……
                                            //あ…ありのまま 今　起こった事を話すぜ！
                                            //「おれは　変数名を変えただけで　いつのまにかログインしていた」
                                            //おれも　何をされたのか　わからなかった…
                                            //頭がどうにかなりそうだった…　引数だとかグローバルだとか
                                            //そんなチャチなもんじゃあ　断じてねえ
                                            //もっと恐ろしいものの片鱗を　味わったぜ…
                                            //
                                            //レジスト後、ログインのため。userと言う変数名がミソのようで、名前を変えるとダメ。(infoに"missing credentials"と帰る)
                                            //passport.authenticateがこの名前を意識してるっぽい。
                                            //username,passwordと言う名前も同様。
                                            var user:{username:string;password:string} = request.body;
                                            user.username = token.username;
                                            user.password = token.password;

                                            passport.authenticate('local', (error:any, user:any):void => {
                                                if (!error) {
                                                    if (user) {
                                                        request.login(user, function (error) {
                                                            if (!error) {
                                                                response.redirect('/');
                                                            } else {
                                                                response.render('error', {meta: config.meta, help: config.help});
                                                            }
                                                        });
                                                    } else {
                                                        response.render('error', {meta: config.meta, help: config.help});
                                                    }
                                                } else {
                                                    response.render('error', {meta: config.meta, help: config.help});
                                                }
                                            })(request, response);
                                        } else {
                                            response.render('register', {
                                                info: config.usernamealreadyregist,
                                                meta: config.meta,
                                                 help: config.help
                                            });
                                        }
                                    });
                            }
                        });
                    } else {
                        response.render('already', {meta: config.meta, help: config.help}); //already
                    }
                } else {
                    response.render('error', {meta: config.meta, help: config.help});
                }
            });
        } else {
            response.render('timeout', {meta: config.meta, help: config.help});
        }
    }

    public post_local_password(request, response):void {
        wrapper.Exception(request, response, (request:any, response:any) => {
            wrapper.Guard(request, response, (request:any, response:any) => {
                var number:number = 82000;
                wrapper.FindOne(response, number, LocalAccount, {$and: [{provider: "local"}, {username: request.body.username}]}, (response:any, account:any) => {
                    if (account) {
                        var smtpUser:any = mailer.createTransport(smtpTransport(config.mailsetting));
                        if (smtpUser) {
                            var tokenValue:Token = {
                                username: request.body.username,
                                password: request.body.password,
                                timestamp: Date.now()
                            };

                            var tokenValueString:string = JSON.stringify(tokenValue);
                            var token:any = libs.Cipher(tokenValueString, config.tokensecret);
                            var resultMail:MailSender = {
                                from: config.mailaccount,
                                to: request.body.username,
                                subject: config.passmailsubject,
                                html: "<br/>" + config.passmailreader + "<a href='http://" + config.domain + "/password/" + token + "'>" + config.passmailtrailer + "</a>" + "<br/>"
                            };

                            smtpUser.sendMail(resultMail, (error:any):void => {
                                if (!error) {
                                    wrapper.SendSuccess(response, {code:0});
                                } else {
                                    wrapper.SendError(response, number + 200, error.message, error);
                                }
                                smtpUser.close();
                            });
                        } else {
                            wrapper.SendError(response, number + 1, config.mailerror, {});
                        }
                    } else {
                        wrapper.SendWarn(response, number + 1, config.usernamenotfound, {});
                    }
                });
            });
        });
    }

    public get_password_token(request, response):void {
        wrapper.Exception(request, response, (request:any, response:any) => {
        var encryptToken = request.params.token;
        try {
            var decryptToken = libs.DeCipher(encryptToken, config.tokensecret);
            var token = JSON.parse(decryptToken);
        } catch(e) {}
        var tokenDateTime = token.timestamp;
        var nowDate = Date.now();
        if ((tokenDateTime - nowDate) < (60 * 60 * 1000)) {
            LocalAccount.findOne({username: token.username}, (error:any, account:any):void => {
                if (!error) {
                    if (account) {
                        var number:number = 83000;
                        account.setPassword(token.password, (error:any):void => {
                            if (!error) {
                                wrapper.Save(response, number, account, ():void => {
                                    response.redirect('/');
                                });
                            } else {
                                response.render('error', {meta: config.meta, help: config.help}); //already
                            }
                        });
                    } else {
                        response.render('already', {meta: config.meta, help: config.help}); //already
                    }
                } else {
                    response.render('error', {meta: config.meta, help: config.help}); //timeout
                }
            })
        } else {
            response.render('timeout', {meta: config.meta, help: config.help}); //timeout
        }
            });
    }

    public post_local_login(request, response):void {
        wrapper.Exception(request, response, (request:any, response:any) => {
            passport.authenticate('local', (error:any, user:any):void => {
                var number:number = 84000;
                if (!error) {
                    if (user) {
                        wrapper.Guard(request, response, (request:any, response:any) => {
                            request.login(user, (error:any):void => {
                                if (!error) {
                                    wrapper.SendSuccess(response, user);
                                } else {
                                    wrapper.SendError(response, number + 1, error.message, error);
                                }
                            });
                        });
                    } else {
                        wrapper.SendError(response, number + 2, config.wrongusername, {});
                    }
                } else {
                    wrapper.SendError(response, number + 3, "", error);
                }
            })(request, response);
        });
    }

    public auth_facebook_callback(request, response):void {
        var number:number = 85000;
        wrapper.FindOne(response, number, LocalAccount, {userid: request.user.id}, (response:any, account:any) => {
            if (!account) {
                wrapper.FindOne(response, number, LocalAccount, {type: "Admin"}, (response:any, admin:any) => {
                    if (admin) {
                        var account:any = new LocalAccount();
                        account.username = request.user.displayName;
                        account.provider = "facebook";
                        account.userid = request.user.id;
                        account.mail = "";
                        account.description = {
                            open: {
                                name: request.user.displayName
                            },
                            closed: {
                                gender: "",
                                age: 0,
                                address: ""
                            }
                        };
                        account.save(():void => {
                        });
                    }
                });
            }
            response.redirect('/');
        });
    }

    public logout(request, response) {
        wrapper.Guard(request, response, (request:any, response:any) => {
            request.logout();
            wrapper.SendSuccess(response, {code:0});
        });
    }

}

module.exports = Auth;