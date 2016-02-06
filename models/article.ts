/// <reference path="../typings/tsd.d.ts" />

'use strict';

declare function require(x: string): any;

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Article = new Schema({
    date: {type: Date, default: Date.now},
    name: {type: String, default: ""},
    title: {type: String, default: ""},
    description: {type: String, default: ""},
    text: {type: String, default: ""},
    tags:[String],
    type:{type: String, default: "text"},
    background:{type: String, default: ""},
    image:{type: String, default: ""},
    status: {type: Number, default:0},
    code:{type:Number, default:0}
});

module.exports = mongoose.model('Article', Article);