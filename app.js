ll = require('./llibR5');
ll.loadSettings(settingsLoaded)
function settingsLoaded(){
    console.log('settings.txt file loaded');
    ll.loadWiz(wizLoaded)
}
function wizLoaded(){
//    console.log(JSON.stringify(global.wiz))
    console.log('wiz.dat file loaded');
}
