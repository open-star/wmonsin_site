/// <reference path="../typings/tsd.d.ts" />

'use strict';

declare function require(x: string): any;

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Experiment = new Schema({
    date: {type: Date, default: Date.now},
    name: {type: String, required: true},
    email:{type: String, required: true}
});

module.exports = mongoose.model('Experiment', Experiment);