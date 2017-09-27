var PeerServer = require('peer').PeerServer;
var fs = require('fs');

var server = PeerServer(
{
    port: 8888,
    timeout: 60000,
    ssl:
    {
        key: fs.readFileSync('../../ssl/keys/a4d39_e14ab_6d5722be2ebc50f81d68e7106eadb7ad.key'),
        cert: fs.readFileSync('../../ssl/certs/vera_bassjansson_com_a4d39_e14ab_1513900799_446111a31b4d9d78162a058862d46cea.crt')
    }
});
