'use strict';

declare function require(x:string):any;

var express = require('express');
var passport:any = require('passport');
var mongoose:any = require('mongoose');
var _:_.LoDashStatic = require('lodash');

var flow:any = require('flow_js').Flow;

var fs:any = require('fs');
var text:any = fs.readFileSync('config/config.json', 'utf-8');
var config:any = JSON.parse(text);

//var contenttext:any = fs.readFileSync('config/content.json', 'utf-8');
//var content:any = JSON.parse(contenttext);

var Wrapper:any = require('./wrapper');
var AuthController:any = require('./controllers/auth_controller');
var AccountController:any = require('./controllers/account_controller');
var ArticleController:any = require('./controllers/article_controller');
var FileController:any = require('./controllers/file_controller');
var ContentController:any = require('./controllers/content_controller');
var MailerController:any = require('./controllers/mailer_controller');
var WebPayController:any = require('./controllers/webpay_controller');
var ExperimentController:any = require('./controllers/experiment_controller');

var LocalAccount:any = require('../models/localaccount');
var ContentModel:any = require('../models/content');
var ArticleModel = require('../models/article');


var wrapper:any = new Wrapper;
var auth_controller:any = new AuthController;
var account_controller:any = new AccountController;
var article_controller:any = new ArticleController;
var file_controller:any = new FileController;
var content_controller = new ContentController;
var mailer_controller = new MailerController;
var webpay_controller = new WebPayController;
var experiment_controller = new ExperimentController;

var router = express.Router();

wrapper.FindOne(null, 1000, LocalAccount, {username: config.user}, (res:any, account:any):void => {
    if (!account) {
        var objectid:any = new mongoose.Types.ObjectId; // Create new id
        var userid:string = objectid.toString();
        LocalAccount.register(new LocalAccount({
                username: config.user,
                userid: userid,
                type: "Admin",
                description: {open: {name: "A"}, closed: {gender: "", age: 0, address: ""}},
            }),
            config.password,
            (error:any):void => {
                if (!error) {
                }
            });
        var contentrecord = new ContentModel();
        contentrecord.content = content;
        contentrecord.save((error:any):void => {});
    } else {
    }
});

function auth(request:any, success, error):void {
    var username:any = "";
    var id:any = null;
    if (request.user) {
        switch (request.user.provider) {
            case "local" :
                username = request.user.username;
                id = request.user.userid;
                break;
            case "facebook" :
                username = request.user.displayName;
                id = request.user.id;
                break;
        }
        success(username, id);
    } else {
        error();
    }
}

class Browser {
    public name:string;
    public isIE:boolean;
    public isiPhone:boolean;
    public isiPod:boolean;
    public isiPad:boolean;
    public isiOS:boolean;
    public isAndroid:boolean;
    public isPhone:boolean;
    public isTablet:boolean;
    public verArray:any;
    public ver:number;

    constructor(userAgent:string) {

        this.name = userAgent.toLowerCase();

        this.isIE = (this.name.indexOf('msie') >= 0 || this.name.indexOf('trident') >= 0);
        this.isiPhone = this.name.indexOf('iphone') >= 0;
        this.isiPod = this.name.indexOf('ipod') >= 0;
        this.isiPad = this.name.indexOf('ipad') >= 0;
        this.isiOS = (this.isiPhone || this.isiPod || this.isiPad);
        this.isAndroid = this.name.indexOf('android') >= 0;
        this.isPhone = (this.isiOS || this.isAndroid);
        this.isTablet = (this.isiPad || (this.isAndroid && this.name.indexOf('mobile') < 0));

        if (this.isIE) {
            this.verArray = /(msie|rv:?)\s?([0-9]{1,})([\.0-9]{1,})/.exec(this.name);
            if (this.verArray) {
                this.ver = parseInt(this.verArray[2], 10);
            }
        }

        if (this.isiOS) {
            this.verArray = /(os)\s([0-9]{1,})([\_0-9]{1,})/.exec(this.name);
            if (this.verArray) {
                this.ver = parseInt(this.verArray[2], 10);
            }
        }

        if (this.isAndroid) {
            this.verArray = /(android)\s([0-9]{1,})([\.0-9]{1,})/.exec(this.name);
            if (this.verArray) {
                this.ver = parseInt(this.verArray[2], 10);
            }
        }
    }
}


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {});
});

/* GET home page. */
router.get('/articles', function (req, res, next) {
    res.render('articles', {});
});

/* GET home page. */
router.get('/privacy', function (req, res, next) {
    res.render('privacy', {});
});

/* GET home page. */
router.get('/law', function (req, res, next) {
    res.render('law', {});
});

/* GET home page. */
router.get('/company', function (req, res, next) {
    res.render('company', {});
});

router.post('/inquiry', mailer_controller.post_contact);

router.get('/dialogs/inquiryconfirmdialog', function (req, res, next) {
    res.render('dialogs/inquiryconfirmdialog', {});
} );

router.get('/dialogs/experimentdialog', function (req, res, next) {
    res.render('dialogs/experimentdialog', {});
} );

router.post('/customer/create', webpay_controller.post_customer_create);
router.post('/charge/create', webpay_controller.post_charge_create);
router.post('/recursion/create', webpay_controller.post_recursion_create);

router.get('/dialogs/customercreatedialog', function (req, res, next) {
    res.render('dialogs/customercreatedialog', {});
} );

router.get('/dialogs/chargecreatedialog', function (req, res, next) {
    res.render('dialogs/chargecreatedialog', {});
} );

router.get('/dialogs/recursioncreatedialog', function (req, res, next) {
    res.render('dialogs/recursioncreatedialog', {});
} );


router.get('/register', (request:any, response:any):void => {
    response.render('register', {meta: config.meta, help: config.help});
});

router.get('/login', (request:any, response:any):void => {
    response.render('login', {user: request.user, meta: config.meta, help: config.help});
});

router.get('/fail', (request:any, response:any):void => {
    response.render('fail', {meta: config.meta, help: config.help});
});

router.get('/accounts', (request:any, response:any):void => {
    response.render('accounts', {meta: config.meta, help: config.help});
});

//! api
router.post('/local/register', auth_controller.post_local_register);
router.get('/register/:token', auth_controller.get_register_token);
router.post('/local/password', auth_controller.post_local_password);
router.get('/password/:token', auth_controller.get_password_token);
router.post('/local/login', auth_controller.post_local_login);
router.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email'], session: true}));
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {failureRedirect: '/'}),
    auth_controller.auth_facebook_callback
);
router.post('/logout', auth_controller.logout);

router.post('/experiment/create', experiment_controller.post_experiment_create);

router.get('/experiment/query/:query', experiment_controller.get_experiment_query_query);

router.get('/backend/dialogs/auth/registerdialog', (request:any, response:any):void => {
    response.render('backend/dialogs/auth/registerdialog');
});

router.get('/backend/dialogs/auth/registerconfirmdialog', (request:any, response:any):void => {
    response.render('backend/dialogs/auth/registerconfirmdialog');
});

router.get('/backend/dialogs/auth/logindialog', (request:any, response:any):void => {
    response.render('backend/dialogs/auth/logindialog');
});

router.get('/backend/dialogs/auth/passworddialog', (request:any, response:any):void => {
    response.render('backend/dialogs/auth/passworddialog');
});

router.get('/backend/dialogs/auth/passwordconfirmdialog', (request:any, response:any):void => {
    response.render('backend/dialogs/auth/passwordconfirmdialog');
});

router.get('/backend/dialogs/article/addarticledialog', (request:any, response:any):void => {
    response.render('backend/dialogs/article/addarticledialog');
});

router.get('/backend/dialogs/article/editarticledialog', (request:any, response:any):void => {
    response.render('backend/dialogs/article/editarticledialog');
});

router.get('/backend/dialogs/article/deletearticledialog', (request:any, response:any):void => {
    response.render('backend/dialogs/article/deletearticledialog');
});

router.get('/backend/', (request:any, response:any):void => {
    var page = {
        title: "Auth",
        description: "Auth",
        background: '/images/bg.jpg',
        image: '/images/coffee.jpg',
        text: "text1",
        type: "image"
    };
    if (request.user) {
        if (request.user.type == "Admin") {
            response.render('backend/index', {user: request.user, provider:request.user.provider, page: page});
        } else {
            response.render('backend/auth', {user: request.user, provider:request.user.provider, page: page});
        }
    } else {
        response.render('backend/auth', {user: request.user, provider:"", page: page});
    }
});

/* GET home page. */
router.get('/*', function (req, res, next) {
        res.render('index', {});
});

module.exports = router;
//# sourceMappingURL=index.js.map