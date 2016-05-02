module.exports = function (options) {
    var seneca = this;
    var plugin = "apn";

    /*
     |--------------------------------------------------------------------------
     | Dependencies
     |--------------------------------------------------------------------------
    */
    var apn = require("apn");
    var Validator = new (require("./validator"))();

    /*
     |--------------------------------------------------------------------------
     | Kue
     |--------------------------------------------------------------------------
    */
    if (options.USE_KUE) {
        var queue = require("kue").createQueue();

        queue.process("ios", options.MAX_CONCURRENT_JOBS, function (job, done) {
            var args = job.data.args;

            pushiOS(args, function (err, result) {
                done(err, result);
            });
        });

        queue.process("safari", options.MAX_CONCURRENT_JOBS, function (job, done) {
            var args = job.data.args;

            pushSafari(args, function (err, result) {
                done(err, result);
            });
        });
    }

    /*
     |--------------------------------------------------------------------------
     | iOS
     |--------------------------------------------------------------------------
    */
    function pushiOS(args, callback) {
        Validator.validateiOS(args, function (err, data) {
            if (err) return callback(err, null);

            var tokens = args.tokens;
            var notification = args.params;

            var apnOptions = {
                "cert": args.config.apn.ios.connection.cert,
                "key": args.config.apn.ios.connection.key,
                "passphrase": args.config.apn.ios.connection.passphrase,
                "production": args.config.apn.ios.connection.production,
            }
            var apnConnection = new apn.Connection(apnOptions);

            var notif = new apn.Notification();
            notif.expiry = notification.expiry || notif.expiry;
            notif.badge = notification.badge || notif.badge;
            notif.sound = notification.sound || notif.sound;
            notif.alert = notification.alert || notif.alert;
            notif.payload = notification.payload || notif.payload;

            var devices = [];
            for (i in tokens) {
                var device = new apn.Device(tokens[i]);
                devices.push(device);
            }

            apnConnection.pushNotification(notif, devices);
            apnConnection.on("error", function (err) {
                console.log(err);
            })
            callback();
        });
    }

    seneca.add({ role: plugin, cmd: "ios" }, function (args, callback) {
        if (options.USE_KUE) {
            queue.create("ios", {
                title: "iOS",
                args: args
            }).attempts(10).removeOnComplete(false).save();

            callback(null, { result: "Processing..." })
        } else {
            pushiOS(args, callback);
        }
    });

    /*
     |--------------------------------------------------------------------------
     | Safari
     |--------------------------------------------------------------------------
    */
    function pushSafari(args, callback) {
        Validator.validateiOS(args, function (err, data) {
            if (err) return callback(err, null);

            var tokens = args.tokens;
            var notification = args.params;

            var apnOptions = {
                "cert": args.config.apn.ios.connection.cert,
                "key": args.config.apn.ios.connection.key,
                "passphrase": args.config.apn.ios.connection.passphrase,
                "production": true,
            }
            var apnConnection = new apn.Connection(apnOptions);

            var notif = new apn.Notification();
            notif.expiry = notification.expiry || notif.expiry;
            notif.badge = notification.badge || notif.badge;
            notif.sound = notification.sound || notif.sound;
            notif.alert = notification.alert || notif.alert;
            notif.payload = notification.payload || notif.payload;
            notif.urlArgs = notification.urlArgs || [];

            var devices = [];
            for (i in tokens) {
                var device = new apn.Device(tokens[i]);
                devices.push(device);
            }

            apnConnection.pushNotification(notif, devices);
            apnConnection.on("error", function (err) {
                console.log(err);
            })
            callback();
        });
    }

    seneca.add({ role: plugin, cmd: "safari" }, function (args, callback) {
        if (options.USE_KUE) {
            queue.create("safari", {
                title: "Safari",
                args: args
            }).attempts(10).removeOnComplete(false).save();

            callback(null, { result: "Processing..." })
        } else {
            pushSafari(args, callback);
        }
    });

    return {
        name: plugin
    }
}
