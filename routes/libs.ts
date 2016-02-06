/// <reference path="../typings/tsd.d.ts" />

'use strict';

declare function require(x:string):any;

var crypto:any = require('crypto');

module.exports = {
    Cipher: (name:string, password:string):string => {
        var cipher:any = crypto.createCipher('aes192', password);
        try {
            var crypted:string = cipher.update(name, 'utf8', 'hex');
            crypted += cipher.final('hex');
            return crypted;
        } catch (ex) {

        }
    },

    DeCipher: (name:string, password:string):string => {
        var decipher:any = crypto.createDecipher('aes192', password);
        try {
            var decrypted:string = decipher.update(name, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (ex) {

        }
    }
};
