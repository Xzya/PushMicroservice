module.exports = function (options) {
    var seneca = this;
    var plugin = "gcm";

    /*
     |--------------------------------------------------------------------------
     | Dependencies
     |--------------------------------------------------------------------------
    */
    var gcm = require("node-gcm");
    var Validator = new (require("./validator"))();

    /*
     |--------------------------------------------------------------------------
     | Chrome multicast
     |--------------------------------------------------------------------------
    */
    seneca.add({ role: plugin, cmd: "chrome:multicast" }, function (args, callback) {
        Validator.validateChromeMulticast(args, function (err, data) {
            if (err) return callback(err, null);

            var message = new gcm.Message();

            var sender = new gcm.Sender(args.config.gcm.apiKey);

            sender.sendNoRetry(message, { registrationTokens: args.tokens }, function (err, response) {
                if (err) callback(err, null);
                else callback(null, { result: response });
            });
        });
    });

    /*
     |--------------------------------------------------------------------------
     | Android
     |--------------------------------------------------------------------------
    */
    seneca.add({ role: plugin, cmd: "android" }, function (args, callback) {
        Validator.validateAndroid(args, function (err, data) {
            if (err) return callback(err, null);

            var message = new gcm.Message(args.params);

            var sender = new gcm.Sender(args.config.gcm.apiKey);

            sender.sendNoRetry(message, { registrationTokens: args.tokens }, function (err, response) {
                if (err) callback(err, null);
                else callback(null, { result: response });
            });
        });
    });

    return {
        name: plugin
    }
}
