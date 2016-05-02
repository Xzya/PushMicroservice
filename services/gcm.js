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
     | Kue
     |--------------------------------------------------------------------------
    */
    if (options.USE_KUE) {
        var queue = require("kue").createQueue();

        queue.process("chrome:multicast", options.MAX_CONCURRENT_JOBS, function (job, done) {
            var args = job.data.args;

            pushChromeMulticast(args, function (err, result) {
                done(err, result);
            });
        });

        queue.process("android", options.MAX_CONCURRENT_JOBS, function (job, done) {
            var args = job.data.args;

            pushAndroid(args, function (err, result) {
                done(err, result);
            });
        });
    }

    /*
     |--------------------------------------------------------------------------
     | Chrome multicast
     |--------------------------------------------------------------------------
    */
    function pushChromeMulticast(args, callback) {
        Validator.validateChromeMulticast(args, function (err, data) {
            if (err) return callback(err, null);

            var message = new gcm.Message();

            var sender = new gcm.Sender(args.config.gcm.apiKey);

            sender.sendNoRetry(message, { registrationTokens: args.tokens }, function (err, response) {
                if (err) callback(err, null);
                else callback(null, { result: response });
            });
        });
    }

    seneca.add({ role: plugin, cmd: "chrome:multicast" }, function (args, callback) {
        if (options.USE_KUE) {
            queue.create("chrome:multicast", {
                title: "Chrome multicast",
                args: args
            }).attempts(10).removeOnComplete(false).save();

            callback(null, { result: "Processing..." })
        } else {
            pushChromeMulticast(args, callback);
        }
    });

    /*
     |--------------------------------------------------------------------------
     | Android
     |--------------------------------------------------------------------------
    */
    function pushAndroid(args, callback) {
        Validator.validateAndroid(args, function (err, data) {
            if (err) return callback(err, null);

            var message = new gcm.Message(args.params);

            var sender = new gcm.Sender(args.config.gcm.apiKey);

            sender.sendNoRetry(message, { registrationTokens: args.tokens }, function (err, response) {
                if (err) callback(err, null);
                else callback(null, { result: response });
            });
        });
    }

    seneca.add({ role: plugin, cmd: "android" }, function (args, callback) {
        if (options.USE_KUE) {
            queue.create("android", {
                title: "Android",
                args: args
            }).attempts(10).removeOnComplete(false).save();

            callback(null, { result: "Processing..." })
        } else {
            pushAndroid(args, callback);
        }
    });

    return {
        name: plugin
    }
}
