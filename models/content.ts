/// <reference path="../typings/main.d.ts" />

'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Content = new Schema({
    date: {type: Date, default: Date.now},
    content:{},
    status: {type: Number, default:0},
    code:{type:Number, default:0}
});

module.exports = mongoose.model('Content', Content);
