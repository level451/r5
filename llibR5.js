gpiomodule = require("./gpio");
const debug = 1;
console.log = (function () {return function (x) {if (debug) {process.stdout.write(ll.ansitime('magenta','llib     ') + x + '\n');}}})();
const fs = require('fs');
const os = require('os');
const readline = require('readline');


exports.loadSettings = function(callback){
    fs.readFile('settings.txt', 'utf8', (err,filetxt) =>{
        if (err) {
        global.settings = {
            webServer:{
                listenPort:3111
            },
            webSocket:{
              listenPort:3112,
              maxConnections:10,
              showConnectioninfo:false
            }
        };
        exports.saveSettings(callback)
        }
        else{
            global.settings = JSON.parse(filetxt)
            callback()

        }


        });
    gpiomodule.gpiotest();
}
exports.saveSettings = function(callback){
    fs.writeFile('settings.txt', JSON.stringify(global.settings,null,4),'utf8',function(err,filetxt){
        if (err ) {
            console.log('Failed to write config file.'+ err)
        }
        else{
           // global.settings = JSON.parse(filetxt.toString())
            console.log('settings.txt not found - created');
            callback();

        }


    });
}
exports.loadWiz = function(callback){

    // default wiz values go here
    global.wiz={
        Baudrate:115200,
        PanID:301,
        Scroll:'up'
    };

    const rl = readline.createInterface({
        input: fs.createReadStream('wiz.dat')
    });

    rl.on('line', (line) => {
    if (line.indexOf(':') != -1){ // make sure there is a :
        // update the global.wiz object
        global.wiz[line.substr(0,line.indexOf(':'))]=line.substr(line.indexOf(':')+1).replace(' ','');

    } else
    {
        console.log('Invalid line colon not found - ignoring:'+line);
    }
});
    rl.on('close',()=> {
        if (callback){callback();}
    })
}







exports.ansi = function (color,text){

    if(os.type() == "Windows_NT") {

        var codes = {

            white: 37
            , black: 30
            , blue: 34
            , cyan: 36
            , green: 32
            , magenta: 35
            , red: 31
            , yellow: 33
            , grey: 90
            , brightBlack: 90
            , brightRed: 91
            , brightGreen: 92
            , brightYellow: 93
            , brightBlue: 94
            , brightMagenta: 95
            , brightCyan: 96
            , brightWhite: 97
            , bold: 1
            , italic: 3
            , underline: 4
            , inverse: 7
            , unbold: 22
            , unitalic: 23
            , ununderline: 24
            , uninverse: 27
        };
    } else
    {
        //  switch black and white for pi
        var codes = {

            white: 30
            , black: 37
            , blue: 34
            , cyan: 36
            , green: 32
            , magenta: 35
            , red: 31
            , yellow: 33
            , grey: 90
            , brightBlack: 90
            , brightRed: 91
            , brightGreen: 92
            , brightYellow: 93
            , brightBlue: 94
            , brightMagenta: 95
            , brightCyan: 96
            , brightWhite: 97
            , bold: 1
            , italic: 3
            , underline: 4
            , inverse: 7
            , unbold: 22
            , unitalic: 23
            , ununderline: 24
            , uninverse: 27
        };
    }
    return '\x1b['+codes[color]+'m'+text+'\x1b['+codes['black']+'m\x1b[27m';

}
exports.ansitime = function(color,text){

    return new Date().toLocaleTimeString()+ ' '+this.ansi(color,text.rpad(14))

}
String.prototype.rpad = function(length) {
    var str = this;
    while (str.length < length)
        str = str + ' ';
    return str;
}