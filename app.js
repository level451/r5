ll = require('./llibR6');
cp = require('./cueprocessor');
const gpiomodule = require("./gpio");
const os = require('os');


ll.loadSettings(settingsLoaded); // calls settingsLoaded when done

function settingsLoaded(){
    console.log('settings file loaded to global.settings');
    ll.getShowVersions(function(showVersion){
        global.settings.showVersion = showVersion
        ll.loadWiz(wizLoaded)
    })

}

function wizLoaded(){
//    console.log(JSON.stringify(global.wiz))
    webserver = require('./webserver')
    ws = require('./websocket')
    if(os.type() != "Windows_NT"){
        ll.openSerialPort('/dev/ttyAMA3',cp.incommingCue); // send all data from serialport to the cue processor
        gpiomodule.setupSwitches();
        ll.wifiandPanIdcheckandset();// puts pan id and wifi in correct mode for the show
    }
}
