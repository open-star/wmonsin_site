/**
 app.ts
 Copyright (c) 2015 7ThCode.
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
 */

/// <reference path="typings/main.d.ts" />

'use strict';

const express = require('express');
const morgan = require('morgan');
morgan.format("original", "[:date] :method :url :status :response-time ms");
const app = express();

const fs = require('fs');
const text = fs.readFileSync('config/config.json', 'utf-8');
const config = JSON.parse(text);
//config.dbaddress = process.env.DBADDRESS || 'localhost';
//config.state = app.get('env');

const log4js = require('log4js');
log4js.configure("config/logs.json");
const logger = log4js.getLogger('request');
logger.setLevel(config.loglevel);

logger.info('-----------------------Invoke---------------------');

if (log4js) {
  logger.info('log4js Ok.');
} else {
  logger.fatal('log4js NG.');
}

if (logger) {
  logger.info('logger Ok.');
} else {
  logger.fatal('logger NG.');
}

if (express) {
  logger.info('express Ok.');
} else {
  logger.fatal('express NG.');
}

if (fs) {
  logger.info('fs Ok.');
} else {
  logger.fatal('fs NG.');
}

if (config) {
  logger.info('config Ok.');
} else {
  logger.fatal('config NG.');
}

const path = require('path');
if (path) {
  logger.info('path Ok.');
} else {
  logger.fatal('path NG.');
}

const favicon = require('serve-favicon');
if (favicon) {
  logger.info('favicon Ok.');
} else {
  logger.fatal('favicon NG.');
}

const cookieParser = require('cookie-parser');
if (cookieParser) {
  logger.info('cookieParser Ok.');
} else {
  logger.fatal('cookieParser NG.');
}

const bodyParser = require('body-parser');
if (bodyParser) {
  logger.info('bodyParser Ok.');
} else {
  logger.fatal('bodyParser NG.');
}

//passport
const passport = require('passport');
if (passport) {
  logger.info('passport Ok.');
} else {
  logger.fatal('passport NG.');
}

const LocalStrategy = require('passport-local').Strategy;
if (LocalStrategy) {
  logger.info('LocalStrategy Ok.');
} else {
  logger.fatal('LocalStrategy NG.');
}

const FacebookStrategy:any = require('passport-facebook').Strategy;
if (FacebookStrategy) {
  logger.info('FacebookStrategy Ok.');
} else {
  logger.fatal('FacebookStrategy NG.');
}

//passport

const session = require('express-session');
if (session) {
  logger.info('session Ok.');
} else {
  logger.fatal('session NG.');
}

const routes = require('./routes/index');
if (routes) {
  logger.info('routes Ok.');
} else {
  logger.fatal('routes NG.');
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

logger.info('Jade Start.');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit:'50mb',extended: true }));
//app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

const mongoose = require('mongoose');
if (mongoose) {
  logger.info('mongoose Ok.');
} else {
  logger.fatal('mongoose NG.');
}

mongoose.Promise = require('q').Promise;

const  MongoStore = require('connect-mongo')(session);
if (MongoStore) {
  logger.info('MongoStore Ok.');
} else {
  logger.fatal('MongoStore NG.');
}

logger.info("mongodb://" + config.dbaddress + "/" + config.dbname);

const options = {server: {socketOptions: {connectTimeoutMS: 1000000}}};
mongoose.connect("mongodb://" + config.dbaddress + "/" + config.dbname, options);

//mongoose.connect("mongodb://useraccount:zz0101@localhost/jumeirah", options);



process.on('uncaughtException', (err) => {
  logger.error('Stop.' + err);
});

process.on('exit', (code) => {
  logger.info('Stop.' + code);
});

//process.on('SIGINT', () => {
//  logger.info('SIGINT.');
//});

app.use(session({
  name: config.sessionname,
  secret: config.tokensecret,
  resave: false,
  rolling: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 365 * 24 * 60 * 60 * 1000
  },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 365 * 24 * 60 * 60,
    clear_interval: 60 * 60
  })
}));

//passport
app.use(passport.initialize());
app.use(passport.session());
//passport

const helmet = require('helmet');
app.use(helmet());
app.use(helmet.hidePoweredBy({setTo: 'JSF/1.2'})); // Impersonation

if (config.state === 'development') {
  app.use(morgan({format: 'original', immediate: true}));
} else {
  const rotatestream = require('logrotate-stream');
  app.use(morgan({format: 'combined', stream: rotatestream({ file: __dirname + '/logs/access.log', size: '100k', keep: 3 })}));
}

logger.info('Access Log OK.');


app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

const Account = require('./models/localaccount');
passport.use(new LocalStrategy(Account.authenticate()));
if (Account) {
  logger.info('Account Ok.');
} else {
  logger.fatal('Account NG.');
}

passport.serializeUser((user, done):void => {
  done(null, user);
});

passport.deserializeUser((obj, done):void => {
  done(null, obj);
});

passport.use(new FacebookStrategy(config.facebook, (accessToken, refreshToken, profile, done):void => {
  //    passport.session.accessToken = accessToken;
  process.nextTick(() => {
    done(null, profile);
  });
}));

//passport.serializeUser(Account.serializeUser());
//passport.deserializeUser(Account.deserializeUser());
//passport

// catch 404 and forward to error handler
app.use((req:any, res:any, next:any):void => {
  const err = new Error('Not Found');
  err.status = 404;
  res.render('error', {
    message: err.message + " " + req.originalUrl,
    error: err
  });
});

if (config.state === 'development') {
  app.use((err:any, req:any, res:any, next:any):void => {
    logger.fatal(err.message);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.use((err:any, req:any, res:any, next:any):void => {
  logger.fatal(err.message);
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.enable('jsonp callback');

module.exports = app;
