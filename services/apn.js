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
     | iOS
     |--------------------------------------------------------------------------
    */
    seneca.add({ role: plugin, cmd: "ios" }, function (args, callback) {
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
        })
    });

    /*
     |--------------------------------------------------------------------------
     | Safari
     |--------------------------------------------------------------------------
    */
    seneca.add({ role: plugin, cmd: "safari" }, function (args, callback) {
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
        })
    });

    return {
        name: plugin
    }
}
