/// <reference path="../typings/tsd.d.ts" />
'use strict';
var crypto = require('crypto');
module.exports = {
    Cipher: function (name, password) {
        var cipher = crypto.createCipher('aes192', password);
        try {
            var crypted = cipher.update(name, 'utf8', 'hex');
            crypted += cipher.final('hex');
            return crypted;
        }
        catch (ex) {
        }
    },
    DeCipher: function (name, password) {
        var decipher = crypto.createDecipher('aes192', password);
        try {
            var decrypted = decipher.update(name, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch (ex) {
        }
    }
};
//# sourceMappingURL=libs.js.map