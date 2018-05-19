


ll = require('./llibR6');

cp = require('./cueprocessor');
const gpiomodule = require("./gpio");
const os = require('os');
global.wiz={
    Baudrate:115200,
    PanID:'301',
    Scroll:'up',
    Backlight:80,
    FadeIn:1,
    FadeOut:2
};
ll.loadSettings(settingsLoaded); // calls settingsLoaded when done

function settingsLoaded(){
    if (!global.settings.failedtoload){
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
                //     gpiomodule.setupSwitches();

        }

    }


}

function wizLoaded(){
//    console.log(JSON.stringify(global.wiz))
    webserver = require('./webserver')
    ws = require('./websocket')
    if(os.type() != "Windows_NT"){
        ll.openSerialPort('/dev/ttyAMA3',cp.incommingCue); // send all data from serialport to the cue processor
        //gpiomodule.setupSwitches();

    }

    ll.wifiandPanIdcheckandset();// puts pan id and wifi in correct mode for the show
    // this also start udp() and gets the system ip address
}