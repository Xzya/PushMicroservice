var seneca = require("seneca")();

seneca.use('./services/push');

seneca.listen();
