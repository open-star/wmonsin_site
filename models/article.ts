/// <reference path="../typings/main.d.ts" />

'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Article = new Schema({
    date: {type: Date, default: Date.now},
    type:{type: String, default: "text"},
    category:{type: String, default: ""},
    tag:{type: String, default: ""},
    publish:{type:Boolean, default:false},
    name: {type: String, default: ""},
    title: {type: String, default: ""},
    description: {type: String, default: ""},
    text:{type: String, default: ""},
    image:{type: String, default: ""},
    status: {type: Number, default:0},
    code:{type:Number, default:0}
});

module.exports = mongoose.model('Article', Article);


/*
 var Article = new Schema({
 date: {type: Date, default: Date.now},
 type:{type: String, default: "text"},

 name: {type: String, default: ""},
 title: {type: String, default: ""},
 description: {type: String, default: ""},
 text: {type: String, default: ""},
 tags:[String],

 background:{type: String, default: ""},
 image:{type: String, default: ""},
 status: {type: Number, default:0},
 code:{type:Number, default:0}
 */
