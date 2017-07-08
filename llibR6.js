const debug = 1;
console.log = (function () {return function (x) {if (debug) {process.stdout.write(ll.ansitime('magenta','llib     ') + x + '\n');}}})();
const fs = require('fs');
const os = require('os');
const xbee = require("./Xbee");
const readline = require('readline');


const battADC = "/sys/bus/iio/devices/iio:device0/in_voltage3_raw";// using ADC 3 on nanopi 2
const sysTemp = "/sys/class/hwmon/hwmon0/device/temp_label";  // this is for nanopi 2
var timerBacklightOn;
var timerBacklightOff;
var timerBacklightTime;
var backlightLevel = 0;
var backlightNanoPiMax = 100;
if(os.type() != "Windows_NT") {
    var com = require('serialport');
    var execSeries = require('exec-series');
}


exports.openSerialPort = function(portname,cb)
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


        serialPort.write('TEST STRING SENDING\r')
        //serialPort.write("VLD# 1 65 1 0\r");
    });

    serialPort.on('data', function(data) {
       console.log('*****************Serial Data Rec:'+data)

        if(data.length <=5){  //lets just assume this data is xbee module data andd not from cs4
           xbee.xbeeReceivedData(data); // send it to the xbee module
        }
        else {
            timeout = new Date();
            if (cb != null) {

                cb(data)
            }
        }
         console.log('Serial Data:'+data);
    });


    serialPort.on('error', function(error) {
        console.error("serial port failed to open:"+error);

    });
}

exports.serialWrite = function(data) {
    serialPort.write(data,function(err, results)
    {

    });
};



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
    try{
        settings.ShowName = fs.readFileSync('./public/show/show.def','utf8');
    } catch (err) {
        settings.ShowName = null;
        console.log('no default showname - please create show.def')
    }
    console.log('Showname from show.def:'+settings.ShowName);
    if (settings.ShowName != null){
        settings.ShowName = settings.ShowName.replace(/[\n\r]/g, '');
    }



    fs.readdir('public/show',(err,data) => {
        wiz.allShowsAvailable = [];
        data.forEach(function(data){
            if (fs.lstatSync('public/show/'+data).isDirectory()){
                console.log('Show found:'+data)
                wiz.allShowsAvailable.unshift(data);
                if (!settings.ShowName){
                    settings.ShowName = data;
                    console.log('because there is no show.def - the show  is set to first show found - '+data);
                }
            } else
            {
                console.log('NON Show found:'+data)
            }

        })

        console.log(data)
        const rl = readline.createInterface({
            input: fs.createReadStream('./public/show/'+settings.ShowName+'/wiz.dat')
        });

        rl.on('line', (line) => {
            if (line.indexOf(':') != -1){ // make sure there is a :
                // update the global.wiz object
                //global.wiz[line.substr(0,line.indexOf(':'))]=line.substr(line.indexOf(':')+1).replace(' ','');
                global.wiz[line.substr(0,line.indexOf(':'))]=line.substr(line.indexOf(':')+1).trim();

            } else
            {
                console.log('Invalid line colon not found - ignoring:'+line);
            }
        });
        rl.on('close',()=> {
            // add a list of available shows to wiz
            if (callback){callback();}
        })
        console.log('wiz.dat file from ./public/show/'+settings.ShowName+' loaded to global.wiz');



    })


    //\\*********

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

exports.getUnitSettings = function(){
    console.log("We are getUnitSettings");
    if(os.type() == "Windows_NT"){// if a windows system, then we can return nothing
        ws.send(JSON.stringify({object:'unitStatus',data:{Battery:'NA',Pan:'NA',Signal:'NA',Temperature:'NA'}}),'r6');
        return;
    }
    var Battery;
    var Temperature;
    var Pan;
    fs.readFile(battADC, 'utf8', (err,filetxt) =>{
        if(err){
            console.log("Battery ERROR: " + err);
        }
        else {
            global.Battery = filetxt;
            console.log("Battery Voltage: "+ global.Battery);
        }


            fs.readFile(sysTemp, 'utf8', (err, filetxt) => {
                if (err) {
                    console.log("Temperature: " + err);
                }
                else {
                    global.Temperature = filetxt;
                    console.log("Temperature: " + global.Temperature);
                }

                xbee.xbeeGetsignalStrength(0, 0, function (Sig) {
                    global.Sig= Sig;

                    xbee.xbeeGetPanID(0,0,function(Pan) {

                        global.Pan = Pan;
                        ws.send(JSON.stringify({object: 'unitStatus',
                            data: {
                                Battery: global.Battery,
                                Pan: global.Pan,
                                Signal: global.Sig,
                                Temperature: global.Temperature
                            }
                        }), 'r6');
                    });
                });

            });

      //  });

    });
}

exports.backlight = function(value,direction){
    var delay;
    backlightLevel = value;
//    console.log("Backlight request: " + backlightLevel + "  direction is: " + direction + " delay is: "+  wiz.FadeIn*(Math.pow(10000,1/(backlightLevel+1))) );

    if(direction == 'up'){
       backlightLevel +=1;
        if(backlightLevel < wiz.Backlight*backlightNanoPiMax/100){
            delay = 10*wiz.FadeIn*(Math.pow(10000,1/(backlightLevel+1)));
            if(delay > 4000){
                delay = 250;
            }
            timerBacklightOn = setTimeout(function(){exports.backlight(backlightLevel, "up")},delay );
        }

    }
    else if(direction == 'down'){
        backlightLevel -=1;
        if(backlightLevel > 0){
            timerBacklightOff = setTimeout(function(){exports.backlight(backlightLevel, "down")}, 10* wiz.FadeOut*Math.exp(1/(backlightLevel+1)));
        }
    }

    if(os.type() != "Windows_NT") {//don't do this on windows
        if(backlightLevel <0){
            return;
        }
        fs.writeFile('/dev/backlight-1wire', backlightLevel, (err) => {
            if (err) {
                console.log("error in writing to backlight");
            }
            else {
                console.log('The backlight value is now: ' + value);
            }
        });
    }
};

exports.backlightOn = function(value){
    console.log("just arrived at backinght up")
    clearTimeout(timerBacklightTime); // already going off, so cleat this timer
    clearTimeout(timerBacklightOn);
    clearTimeout(timerBacklightOff);
    if(value !=null){
        exports.backlight(value*backlightNanoPiMax/100); // if no parameter just turn on backlight to the percentage indicated in value
    }
    else {  //called without a value
        exports.backlight(backlightLevel,"up");
      //  timerBacklightTime = setTimeout(function () {exports.backlightOff()}, wiz.OnTime * 10000);// set the timer to time things out and turn off
    }
};

exports.backlightOff = function(){
    console.log("just arrived at backinght DOWN");
    clearTimeout(timerBacklightTime); // already going off, so cleat this timer
    clearTimeout(timerBacklightOn);
    clearTimeout(timerBacklightOff);
    exports.backlight(backlightLevel,"down");
};

exports.wifiCheck = function(){
    var currentSSID;
    var currentPASSWORD;
    if(wiz.Ssid == null){
        wiz.Ssid = "None";
    }
    if(wiz.Pass == null){
        wiz.Pass = "None";
    }
    wiz.Ssid = wiz.Ssid.trim();
    wiz.Pass = wiz.Pass.trim();
    console.log("wiz.ssid " + wiz.Ssid + " length "+ wiz.Ssid.length);
    console.log("wiz.Pass "+ wiz.Pass + " length " + wiz.Pass.length);
    const rl = readline.createInterface({
        input: fs.createReadStream('/etc/wpa_supplicant/wpa_supplicant.conf')
    });

    rl.on('line', (line) => {
        console.log(line);
        if(line.includes("ssid")){
            currentSSID=line.substring(line.lastIndexOf("ssid=")+6,line.lastIndexOf('"')).trim();
            console.log("current ssid: "+ currentSSID  + " length: " + currentSSID.length );
        }
        if(line.includes("psk")) {
            currentPASSWORD = line.substring(line.lastIndexOf("psk=") + 5, line.lastIndexOf('"')).trim();
            console.log("current Password: "+ currentPASSWORD + " length: " + currentPASSWORD.length);
        }

        // if (line.indexOf(':') != -1){ // make sure there is a :
        //     // update the global.wiz object
        //     global.wiz[line.substr(0,line.indexOf(':'))]=line.substr(line.indexOf(':')+1).replace(' ','');
        //
        // } else
        // {
        //     console.log('Invalid line colon not found - ignoring:'+line);
        // }
    });
    rl.on('close',()=> {
        console.log("End of File")
        setTimeout(function(){exports.getIPAddres()}, 20000);// wait 20 seconds and then get ip address
        if((currentSSID == wiz.Ssid) && (currentPASSWORD == wiz.Pass)){

            console.log("there is nothing in wifi that needs to be changed");
        }
        else{

            console.log("need to change wifi stuff here");
            fs.readFile('/etc/wpa_supplicant/wpa_supplicant.conf', 'utf8', function (err,data) {
                if (err) {
                    return console.log(err);
                }
                var result = data.replace(currentSSID, wiz.Ssid);
                fs.writeFile('/etc/wpa_supplicant/wpa_supplicant.conf', result, 'utf8', function (err) {
                    if (err) return console.log(err);
                    console.log("file contents replaced")

                    fs.readFile('/etc/wpa_supplicant/wpa_supplicant.conf', 'utf8', function (err,data) {
                        if (err) {
                            return console.log(err);
                        }
                        var result = data.replace(currentPASSWORD, wiz.Pass);
                        fs.writeFile('/etc/wpa_supplicant/wpa_supplicant.conf', result, 'utf8', function (err) {
                            if (err) return console.log(err);
                            console.log("file contents replaced2")
                        });
                    });
                });

                execSeries(['sudo /sbin/ifdown wlan0'], (err, stdouts, stderrs) => {//
                    if (err) {
                        console.log(err);
                        throw err;
                    }

                    console.log(stdouts); // yields: ['foo\n', 'bar\n']
                    console.log(stderrs); // yields: ['', '']
                    execSeries(['sudo /sbin/ifup wlan0'], (err, stdouts, stderrs) => {//
                        // execSeries(['sudo  -u fa  /sbin/ifup wlan0'], (err, stdouts, stderrs) => {//
                        if (err) {
                            console.log(err);
                            throw err;
                        }

                        console.log(stdouts); // yields: ['foo\n', 'bar\n']
                        console.log(stderrs); // yields: ['', '']
                    });
                });
            });
        }
    });
}

exports.wifiandPanIdcheckandset= function(){
    if(os.type() != "Windows_NT") {//dont do this on windows!
        exports.wifiCheck();
        xbee.xbeeGetPanID(0, 0, function (Pan) {
            wiz.PanID = wiz.PanID.trim();
            Pan = Pan.trim();
            console.log("PAN ID Want: " + wiz.PanID + " Have: " + Pan + " Pan Id Want length: "+ wiz.PanID.length+ " Have Length: " + Pan.length);
            if (Pan != wiz.PanID) {//if the pan id is not the one we want then change it
                console.log("changing Pan ID");
                setTimeout(function () {
                    xbee.xbeeSetPanID(0, 0, wiz.PanID)
                }, 1600);
            }
        });
    }
}

exports.getIPAddres = function(){
    //iterate through all of the system IPv4 addresses
    // we should connect to address[0] with the webserver
    //so lets grab it and make a global variable to
    //use elseware
    var interfaces = os.networkInterfaces();
    global.addresses = [];
    for (k in interfaces) {
        for (k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family == 'IPv4' && !address.internal) {
                addresses.push(address.address)
            }
        }
    }
    global.myuri = addresses[0];
    console.log('My IP Address 0 is: ' + addresses[0] + " Address 1: " +addresses[1] );
}