ll = require('./llibR6');
cp = require('./cueprocessor');
gpiomodule = require("./gpio");
const os = require('os');


ll.loadSettings(settingsLoaded); // calls settingsLoaded when done

function settingsLoaded(){
    console.log('settings file loaded to global.settings');
    ll.loadWiz(wizLoaded)
}

function wizLoaded(){
//    console.log(JSON.stringify(global.wiz))
    console.log('wiz.dat file loaded to global.wiz');
    webserver = require('./webserver')
    ws = require('./websocket')
    if(os.type() != "Windows_NT"){
        ll.openSerialPort('/dev/ttyAMA3',cp.incommingCue); // send all data from serialport to the cue processor
        gpiomodule.setupSwitches();
    }
}
