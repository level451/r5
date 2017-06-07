gpiomodule = require("./gpio");
const debug = 1;
console.log = (function () {return function (x) {if (debug) {process.stdout.write(ll.ansitime('magenta','llib     ') + x + '\n');}}})();
const fs = require('fs');
const os = require('os');
const readline = require('readline');
if(os.type() != "Windows_NT") {
    const com = require('serialport');
}


function openSerialPort(portname,cb)
{
    // console.log("Attempting to open serial port "+portname);
    // serialport declared with the var to make it module global
    if (portname == undefined) {
        console.log("Serial port not specified as command line - no serial port open");
        return;

    }
    //serialPort = new com.SerialPort(portname, {
    serialPort = new com(portname, {
        baudrate: 115200,
// Set the object to fire an event after a \r (chr 13 I think)  is in the serial buffer
        parser: com.parsers.readline("\r")
    });


    serialPort.on("open", function (err,res) {
        serialPort.set({dtr:true,rts:false});
        console.log("Port open success:"+portname);


        //serialPort.write('r\r')
        //serialPort.write("VLD# 1 65 1 0\r");
    });

    serialPort.on('data', function(data) {
        timeout = new Date();
        if (cb != null){

            cb(data)
        }
         console.log('Serial Data:'+data);
    });


    serialPort.on('error', function(error) {
        console.error("serial port failed to open:"+error);

    });
}
exports.loadSettings = function(callback){
    fs.readFile('settings', 'utf8', (err,filetxt) =>{
        if (err) {
            console.log ('settings not found - attemting to load from settings.default')
            fs.readFile('settings.default', 'utf8', (err,filetxt) =>{
                if (err) {


                    global.settings = {
                        webServer: {
                            listenPort: 3111
                        },
                        webSocket: {
                            listenPort: 3112,
                            maxConnections: 10,
                            showConnectioninfo: false
                        }
                    }
                    exports.saveSettings(callback)
                } else
                {
                    global.settings = JSON.parse(filetxt);
                    callback();

                    // exports.saveSettings(callback)


                }

            });
        }
        else{
            global.settings = JSON.parse(filetxt);
            callback();

        }


        });

}
exports.saveSettings = function(callback){
    fs.writeFile('settings', JSON.stringify(global.settings,null,4),'utf8',function(err,filetxt){
        if (err ) {
            console.log('Failed to write config file.'+ err);
        }
        else{
           // global.settings = JSON.parse(filetxt.toString())
            console.log('settings not found - created');
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
        input: fs.createReadStream('./wiz.dat')
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
        // add a list of available shows to wiz
        fs.readdir('public/show',(err,data) => {
            wiz.allShowsAvailable = [];
            data.forEach(function(data){
                if (fs.lstatSync('public/show/'+data).isDirectory()){
                 console.log('Show found:'+data)
                    wiz.allShowsAvailable.unshift(data);
                } else
                {
                    console.log('NON Show found:'+data)
                }

            })

            console.log(data)
            if(os.type() != "Windows_NT"){
                openSerialPort('/dev/ttyAMA3',cp.incommingCue); // send all data from serialport to the cue processor
                gpiomodule.setupSwitches();
            }

            if (callback){callback();}

        })


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