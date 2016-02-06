/// <reference path="../typings/tsd.d.ts" />

'use strict';

declare function require(x: string): any;

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Content = new Schema({
    date: {type: Date, default: Date.now},
    content:{},
    status: {type: Number, default:0},
    code:{type:Number, default:0}
});

module.exports = mongoose.model('Content', Content);