var proto = require("steam-resources"),
    fs = require("fs");



var FILENAME = "match.dem.info";



var file = fs.readFileSync(FILENAME);

var decoded =  proto.GC.CSGO.Internal.CDataGCCStrike15_v2_MatchInfo.decode(file);
console.log(decoded)


var protoObject = new proto.GC.CSGO.Internal.CDataGCCStrike15_v2_MatchInfo(decoded)
//console.log(protoObject.toBuffer());


fs.writeFile("newfile.dem.info", protoObject.toBuffer(), function (err) {
    if (err) {
        console.log("Error", err);
    } else {
        console.log("File saved")
    }
})

