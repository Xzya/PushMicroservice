module.exports = function (options) {
    var seneca = this;
    var plugin = "web-push";

    /*
     |--------------------------------------------------------------------------
     | Dependencies
     |--------------------------------------------------------------------------
    */
    var webPush = require("web-push");
    var Validator = new (require("./validator"))();

    /*
     |--------------------------------------------------------------------------
     | Firefox 44+
     |--------------------------------------------------------------------------
    */
    seneca.add({ role: plugin, cmd: "firefox" }, function (args, callback) {
        Validator.validateFirefox(args, function (err) {
            if (err) return callback(err);

            webPush.sendNotification(args.token, args.params)
                .then(function (result) {
                    callback(null, { result: result });
                }).catch(function (err) {
                    callback(err, null);
                });
        });
    });

    /*
     |--------------------------------------------------------------------------
     | Chrome 50+
     |--------------------------------------------------------------------------
    */
    seneca.add({ role: plugin, cmd: "chrome" }, function (args, callback) {
        Validator.validateChrome(args, function (err) {
            if (err) return callback(err);

            webPush.setGCMAPIKey(args.config.gcm.apiKey);
            webPush.sendNotification(args.token, args.params)
                .then(function (result) {
                    callback(null, { result: result });
                }).catch(function (err) {
                    callback(err, null);
                });
        });
    });

    return {
        name: plugin
    }
}
