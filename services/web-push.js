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
     | Kue
     |--------------------------------------------------------------------------
    */
    if (options.USE_KUE) {
        var queue = require("kue").createQueue();

        queue.process("firefox", options.MAX_CONCURRENT_JOBS, function (job, done) {
            var args = job.data.args;

            pushFirefox(args, function (err, result) {
                done(err, result);
            });
        });

        queue.process("chrome", options.MAX_CONCURRENT_JOBS, function (job, done) {
            var args = job.data.args;

            pushChrome(args, function (err, result) {
                done(err, result);
            });
        });
    }

    /*
     |--------------------------------------------------------------------------
     | Firefox 44+
     |--------------------------------------------------------------------------
    */
    function pushFirefox(args, callback) {
        Validator.validateFirefox(args, function (err) {
            if (err) return callback(err);

            webPush.sendNotification(args.token, args.params)
                .then(function (result) {
                    callback(null, { result: result });
                }).catch(function (err) {
                    callback(err, null);
                });
        });
    }

    seneca.add({ role: plugin, cmd: "firefox" }, function (args, callback) {
        if (options.USE_KUE) {
            queue.create("firefox", {
                title: "Firefox",
                args: args
            }).attempts(10).removeOnComplete(false).save();

            callback(null, { result: "Processing..." })
        } else {
            pushFirefox(args, callback);
        }
    });

    /*
     |--------------------------------------------------------------------------
     | Chrome 50+
     |--------------------------------------------------------------------------
    */
    function pushChrome(args, callback) {
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
    }

    seneca.add({ role: plugin, cmd: "chrome" }, function (args, callback) {
        if (options.USE_KUE) {
            queue.create("chrome", {
                title: "Chrome",
                args: args
            }).attempts(10).removeOnComplete(false).save();

            callback(null, { result: "Processing..." })
        } else {
            pushChrome(args, callback);
        }
    });

    return {
        name: plugin
    }
}
