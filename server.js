var seneca = require("seneca")();
var config = require("./config/node_config.json");

/*
 |--------------------------------------------------------------------------
 | Configuration
 |--------------------------------------------------------------------------
*/
if (config.USE_KUE) {
    var kue = require("kue");

    // gracefully shut down kue
    process.once('SIGTERM', function (sig) {
        kue.createQueue().shutdown(5000, function (err) {
            console.log('Kue shutdown: ', err || '');
            process.exit(0);
        });
    });

    kue.createQueue().watchStuckJobs(60 * 1000);

    // optional, start kue web interface
    kue.app.listen(3001);
}

/*
 |--------------------------------------------------------------------------
 | Start server
 |--------------------------------------------------------------------------
*/
// start seneca
seneca.use('./services/push', config);
seneca.listen({ pin: "role:push" });
