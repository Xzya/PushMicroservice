module.exports = function (options) {
    var seneca = this;
    var plugin = "push";

    /*
     |--------------------------------------------------------------------------
     | Dependencies
     |--------------------------------------------------------------------------
    */
    var apn = require("apn");
    var Validator = new (require("./validator"))();

    /*
     |--------------------------------------------------------------------------
     | Plugins
     |--------------------------------------------------------------------------
    */
    seneca.use("./services/web-push");
    seneca.use("./services/gcm");
    seneca.use("./services/apn");

    /*
     |--------------------------------------------------------------------------
     | Push
     |--------------------------------------------------------------------------
    */
    seneca.add({ role: plugin, cmd: "push" }, function (args, callback) {
        Validator.validatePushRequest(args, function (err) {
            if (err) return callback(err);

            var config = args.config;
            var notifications = args.notifications;

            var chromeTokens = [];
            var chromeMulticastTokens = [];

            for (var i = 0; i < notifications.length; i++) {
                var notification = notifications[i];
                var tokens = notification.tokens;
                var platform = notification.platform;

                // Chrome 50+, we can send the payload directly
                if (platform.type === "chrome" && parseInt(platform.version) >= 50) {

                    // format the endpoints
                    // add the gcm url if we only have the tokens
                    tokens = tokens.map(function (value) {
                        return "https://android.googleapis.com/gcm/send/" + value.split("/").pop();
                    });

                    for (var j = 0; j < tokens.length; j++) {
                        seneca.act({ role: "web-push", cmd: "chrome", token: tokens[j], config: config, params: notification.web }, function (err, result) {

                        });
                    }
                }
                // Chrome < 50, we can't send payload, so send a multicast notification
                else if (platform.type === "chrome" && parseInt(platform.version) < 50) {

                    var batches = [];

                    // if we have more than 1000 tokens, split them in 1000 groups
                    while (tokens.length > 0) {
                        batches.push(tokens.splice(0, 1000));
                    }

                    for (var j = 0; j < batches.length; j++) {
                        seneca.act({ role: "gcm", cmd: "chrome:multicast", config: config, tokens: batches[j] }, function (err, result) {

                        });
                    }
                }
                // Firefox 44+, we can send the payload directly
                else if (platform.type === "firefox" && parseInt(platform.version) >= 44) {

                    // format the endpoints
                    // add the mozilla url if we only have the tokens
                    tokens = tokens.map(function (value) {
                        return "https://updates.push.services.mozilla.com/push/v1/" + value.split("/").pop();
                    });

                    for (var j = 0; j < tokens.length; j++) {
                        seneca.act({ role: "web-push", cmd: "firefox", token: tokens[j], params: notification.web }, function (err, result) {

                        });
                    }
                }
                // Android, we can send the payload directly
                else if (platform.type === "android") {

                    var batches = [];

                    // if we have more than 1000 tokens, split them in 1000 groups
                    while (tokens.length > 0) {
                        batches.push(tokens.splice(0, 1000));
                    }

                    for (var j = 0; j < batches.length; j++) {
                        seneca.act({ role: "gcm", cmd: "android", config: config, tokens: batches[j], params: notification.android }, function (err, result) {

                        });
                    }
                }
                // iOS, we can send the payload directly
                else if (platform.type === "ios") {

                    seneca.act({ role: "apn", cmd: "ios", config: config, tokens: tokens, params: notification.ios }, function (err, result) {

                    });
                }
                // Safari, we can send the payload directly
                else if (platform.type === "safari") {

                    seneca.act({ role: "apn", cmd: "safari", config: config, tokens: tokens, params: notification.safari }, function (err, result) {

                    });
                }
            }
            callback();
        })
    });

    return {
        name: plugin
    }
}
