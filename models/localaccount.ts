/// <reference path="../typings/main.d.ts" />

'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var LocalAccount = new Schema({
    provider: {type: String, default: "local"},
    type: {type: String, default: "User"},
    userid: {type: String, required: true},
    username: {type:String, default: ""},
    password: {type:String, default: ""},
    time: {type: Date, default: Date.now},
    mail: {type:String, default: ""},
    description: {},
    status: {type: Number, default:0},
    code:{type:Number, default:0}
});

LocalAccount.plugin(passportLocalMongoose);

module.exports = mongoose.model('LocalAccount', LocalAccount);
