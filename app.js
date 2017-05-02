ll = require('./llibR6');
cp = require('./cueprocessor');
ll.loadSettings(settingsLoaded);
function settingsLoaded(){
    console.log('settings.txt file loaded to global.settings');
    ll.loadWiz(wizLoaded)
}

function wizLoaded(){
//    console.log(JSON.stringify(global.wiz))
    console.log('wiz.dat file loaded to global.wiz');
    webserver = require('./webserver')
    ws = require('./websocket')
}
