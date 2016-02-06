/// <reference path="../typings/tsd.d.ts" />

'use strict';

class Result {
    private code:number;
    private value:any;

    constructor(code:number, value:any) {
        this.code = code;
        this.value = value;
    }
}

module.exports = Result;