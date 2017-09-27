console.log('exit')
process.exit(0)
console.log('exit done ')



ll = require('./llibR6');
cp = require('./cueprocessor');
const gpiomodule = require("./gpio");
const os = require('os');

ll.loadSettings(settingsLoaded); // calls settingsLoaded when done

function settingsLoaded(){
    if (!global.settings.failedtoload){
        console.log('settings file loaded to global.settings');
        ll.getShowVersions(function(showVersion){
            global.settings.showVersion = showVersion
            ll.loadWiz(wizLoaded)
        })

    } else
    {
        //settings not loaded
        console.log('settings NOT file loaded to global.settings');

        webserver = require('./webserver')
        ws = require('./websocket')
        if(os.type() != "Windows_NT"){
                     gpiomodule.setupSwitches();

        }

    }


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