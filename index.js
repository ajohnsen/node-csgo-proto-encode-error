var Steam = require("steam"),
    fs = require("fs"),
    csgo = require("csgo"),
    util = require("util"),
    steamClient = new Steam.SteamClient(),
    steamUser = new Steam.SteamUser(steamClient),
    steamGC = new Steam.SteamGameCoordinator(steamClient, 730),
    CSGOCli = new csgo.CSGOClient(steamUser, steamGC, true),
    crypto = require("crypto"),
    protos = require("steam-resources");


Steam.servers = require("./servers.json");

var username = process.env.STEAM_USERNAME;
var password = process.env.STEAM_PASSWORD;



var onSteamLogOn = function onSteamLogOn(response) {
    if (response.eresult == Steam.EResult.OK) {
        util.log("Logged in")
    } else {
        util.log("error")
        process.exit();
    }
    util.log("Current SteamID64: " + steamClient.steamID);
    util.log("Account ID: " + CSGOCli.ToAccountID(steamClient.steamID));
    CSGOCli.launch();
}


var SHARECODE = "CSGO-PhrzT-PR6hC-w2zoJ-Kk82i-P564E";


CSGOCli.on("ready", function() {
    var decodedSharecode = new csgo.SharecodeDecoder(SHARECODE).decode();
    console.log(decodedSharecode)

    CSGOCli.requestGame(decodedSharecode.matchId, decodedSharecode.outcomeId, parseInt(decodedSharecode.tokenId));




});


CSGOCli.on("matchList", function(list) {
    if (list.matches && list.matches.length > 0) {
        util.log("Matchlist recieved");
        util.log(list.matches[0]);
        var matchInfoProtobuf = new protos.GC.CSGO.Internal.CDataGCCStrike15_v2_MatchInfo(list.matches[0]);
        

    }
})
steamClient.on('error', function(response) {
    console.log(response)
});

function MakeSha(bytes) {
    var hash = crypto.createHash('sha1');
    hash.update(bytes);
    return hash.digest();
}

var onSteamSentry = function onSteamSentry(sentry) {
    util.log("Received sentry.");
    ensureDirectoryExistence("sentry")
    fs.writeFileSync('sentry', sentry, function(err) {
        if (err) {
            util.log(err);
        }
    });
}

var onSteamServers = function onSteamServers(servers) {
    util.log("Received servers.");
    fs.writeFile('servers.json', JSON.stringify(servers, null, 2), function(err) {
        if (err) {
            util.log(err)
        }
    });
}

var logOnDetails = {
    "account_name": username,
    "password": password,
};
util.log(logOnDetails)
var sentry = fs.readFileSync('sentry');
if (sentry.length) {
    logOnDetails.sha_sentryfile = MakeSha(sentry);
}
steamClient.connect();
steamUser.on('updateMachineAuth', function(response, callback){
    fs.writeFileSync('sentry', response.bytes);
    callback({ sha_file: MakeSha(response.bytes) });
});
steamClient.on("logOnResponse", onSteamLogOn)
    .on('sentry', onSteamSentry)
    .on('servers', onSteamServers)
    .on('connected', function(){
        steamUser.logOn(logOnDetails);
    });




