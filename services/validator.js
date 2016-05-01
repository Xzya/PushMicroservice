module.exports = function () {
    /*
     |--------------------------------------------------------------------------
     | Push request
     |--------------------------------------------------------------------------
    */
    this.validatePushRequest = function (args, callback) {
        if (!args.config) return callback(new Error("Missing config parameter."));
        if (!args.notifications) return callback(new Error("Missing notifications parameter."));
        if (args.notifications.length === 0) return callback(new Error("Needs at least one notification."));
        callback();
    };

    /*
     |--------------------------------------------------------------------------
     | Chrome multicast
     |--------------------------------------------------------------------------
    */
    this.validateChromeMulticast = function (args, callback) {
        if (!args.config) callback(new Error("Missing config parameter."));
        if (!args.config.gcm) callback(new Error("Missing gcm parameter."));
        if (!args.config.gcm.apiKey) callback(new Error("Missing GCM API Key."));
        if (!args.tokens) callback(new Error("Missing tokens."));
        if (args.tokens.length === 0) callback(new Error("Needs at least one token."));
        if (args.tokens.length > 1000) callback(new Error("Needs at most 1000 tokens."));
        callback();
    };

    /*
     |--------------------------------------------------------------------------
     | Chrome 50+
     |--------------------------------------------------------------------------
    */
    this.validateChrome = function (args, callback) {
        if (!args.config) callback(new Error("Missing config parameter."));
        if (!args.config.gcm) callback(new Error("Missing gcm parameter."));
        if (!args.config.gcm.apiKey) callback(new Error("Missing GCM API Key."));
        if (!args.token) callback(new Error("Missing token."));
        callback();
    };

    /*
     |--------------------------------------------------------------------------
     | Firefox
     |--------------------------------------------------------------------------
    */
    this.validateFirefox = function (args, callback) {
        if (!args.token) callback(new Error("Missing token."));
        callback();
    };

    /*
     |--------------------------------------------------------------------------
     | Android
     |--------------------------------------------------------------------------
    */
    this.validateAndroid = function (args, callback) {
        if (!args.config) callback(new Error("Missing config parameter."));
        if (!args.config.gcm) callback(new Error("Missing gcm parameter."));
        if (!args.config.gcm.apiKey) callback(new Error("Missing GCM API Key."));
        if (!args.tokens) callback(new Error("Missing tokens."));
        if (args.tokens.length === 0) callback(new Error("Needs at least one token."));
        if (args.tokens.length > 1000) callback(new Error("Needs at most 1000 tokens."));
        callback();
    };

    /*
     |--------------------------------------------------------------------------
     | iOS
     |--------------------------------------------------------------------------
    */
    this.validateiOS = function (args, callback) {
        if (!args.config) callback(new Error("Missing config parameter."));
        if (!args.config.apn) callback(new Error("Missing apn parameter."));
        if (!args.config.apn.ios) callback(new Error("Missing ios parameter."));
        if (!args.config.apn.ios.connection) callback(new Error("Missing connection parameter."));
        if (!args.config.apn.ios.connection.production) callback(new Error("Missing production parameter."));
        if (!args.config.apn.ios.connection.cert) callback(new Error("Missing cert parameter."));
        if (!args.config.apn.ios.connection.key) callback(new Error("Missing key parameter."));
        if (!args.config.apn.ios.connection.passphrase) callback(new Error("Missing passphrase parameter."));
        if (!args.tokens) callback(new Error("Missing tokens."));
        if (args.tokens.length === 0) callback(new Error("Needs at least one token."));
        callback();
    };

    /*
     |--------------------------------------------------------------------------
     | Safari
     |--------------------------------------------------------------------------
    */
    this.validateSafari = function (args, callback) {
        if (!args.config) callback(new Error("Missing config parameter."));
        if (!args.config.apn) callback(new Error("Missing apn parameter."));
        if (!args.config.apn.safari) callback(new Error("Missing safari parameter."));
        if (!args.config.apn.safari.connection) callback(new Error("Missing connection parameter."));
        if (!args.config.apn.safari.connection.cert) callback(new Error("Missing cert parameter."));
        if (!args.config.apn.safari.connection.key) callback(new Error("Missing key parameter."));
        if (!args.config.apn.safari.connection.passphrase) callback(new Error("Missing passphrase parameter."));
        if (!args.tokens) callback(new Error("Missing tokens."));
        if (args.tokens.length === 0) callback(new Error("Needs at least one token."));
        callback();
    };
}
