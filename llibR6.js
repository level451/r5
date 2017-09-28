 const debug = true;
var console = {};
console.log = (function () {return function (x) {if (debug) {process.stdout.write(ll.ansitime('blue','llib     ') + x + '\n');}}})();

const showPath = 'public/show/' //also in websocket
const fs = require('fs');
const WebSocket = require('ws');
os = require('os');
xbee = require("./Xbee");
const readline = require('readline');
var pjson = require('./package.json');
list = [] // list for files to get
fileListCounter = 0;
const battADC = "/sys/bus/iio/devices/iio:device0/in_voltage3_raw";// using ADC 3 on nanopi 2
const sysTemp = "/sys/class/hwmon/hwmon0/device/temp_label";  // this is for nanopi 2
const macAddress = "/sys/class/net/wlan0/address"; // this is for nanopi 2;
const macAddress2 = "/sys/class/net/wlan1/address"; // this is for nanopi 2
const childProcess = require('child_process');
var browser

global.testMode = false;
global.demoMode = false;
var timerBacklightOn;
var timerBacklightOff;
//var timerBacklightTime;
var backlightLevel = 0;
var backlightNanoPiMax = 100;
var battTimer;
var battCounter = 0;
var battVoltage = 0;
var steps = 20;
 var logBase = 2;
 var exponent = 0;
 const fadeoutTime = [steps];
 var timerBacklightDown = [steps+1];
 var timerBacklightUp = [steps+1];

 const value = [steps];

if(os.type() != "Windows_NT") {

    var com = require('serialport');
    var execSeries = require('exec-series');
    updateBattTemp();
    setInterval(function(){updateBattTemp()},300000); //update global.Battery and global.Temperature every 5 minutes

//this is for USB detection -- added 09/16/2017
    var usbDetect = require('usb-detection');

    // Detect add/insert
        usbDetect.on('add', function(device) {
            console.log("USB Inserted");
            timerDirExists = setTimeout(function(){checkFolderExists()},3000 ); // wait for usbstick to be mounted
        });
    //usbDetect.on('add:vid', function(device) { console.log('add', device); });
    //usbDetect.on('add:vid:pid', function(device) { console.log('add', device); });

    // Detect remove
        usbDetect.on('remove', function(device) {
            console.log("USB Removed");
            ws.send(JSON.stringify({object:'loadMain'}),'r6');

        });

// ^^^^^^^^^   this is for USB detection -- added 09/16/2017
}
 exports.setVolumeGain = function(){
     childProcess.exec('amixer sset DAC 192', (err, stdouts, stderrs) => {//sets volume to max
         if (err) {
             console.log(err);
             throw err;
         }

         console.log(stdouts); // yields: ['foo\n', 'bar\n']
         console.log(stderrs); // yields: ['', '']
         console.log("****Audio level set");
     });


 }
exports.startBrowser = function(){


     //browser =  childProcess.exec('DISPLAY=:0 sudo -u fa chromium-browser --incognito --kiosk http://localhost:'+settings.webServer.listenPort+'/ ', (err, stdouts, stderrs) => {//finally starts up withD DOSPLAY:0  -- WHO KNOWS WHY?
    browser =  childProcess.spawn('DISPLAY=:0 sudo',['-u', 'fa','chromium-browser','--incognito','--kiosk','http://localhost:'+settings.webServer.listenPort+'/ ']);


 }
exports.stopBrowser = function(){
console.log('browser kill')
    browser.kill();

}
 exports.usbDisconnect = function(restart){
    console.log('usbdisconnect')
    webserver.close();
    if (typeof(usbDetect) != 'undefined'){
        console.log('usbstopmonitoring')
        usbDetect.stopMonitoring();
        if (restart){
            console.log('restart')
            process.exit(100)
        }
    } else
    {
        if (restart){
            console.log('restart')
            process.exit(100)
        }
    }

}
 function checkFolderExists() {
     if (fs.existsSync('/media/usb0/show')) {
         console.log("We have a Show Directory -- do something");
         ws.send(JSON.stringify({object:'usb'}),'r5');

     }
     else {
         console.log("USB inserted but no Show Directory");
     }

 }

udp(); // start the udp server

 getMACAddress(function(){
    console.log('MAC Obtained - starting PH')
    require('./ph').start();

    }); // gets Mac address to gloabel.Mac




function updateBattTemp() {
    battTimer = setInterval(function(){updateBattery()}, 500); //start the battery process
    fs.readFile(sysTemp, 'utf8', (err, filetxt) => { //get the temperature
        if (err) {
            console.log("Temperature: " + err );
        }
        else {
            global.Temperature = filetxt.replace(/[\n\r]/g, '');
           // console.log("Temperature of unit is: " + global.Temperature);
        }
    });
}

function updateBattery(){
    fs.readFile(battADC, 'utf8', (err,filetxt) => {
        if (err) {
            console.log("Battery ERROR:  " + err );
        }
        else {
                battVoltage += parseInt(filetxt);
                battCounter ++;

                if(battCounter == 20) {

                    clearInterval(battTimer);
                    battVoltage = battVoltage/battCounter; //get the average reading

                    battCounter = 0; //clear it so we can start over
                    //console.log("Batt Averaged Raw Value: " + battVoltage);
                    global.Battery = (battVoltage * .003310466).toFixed(2);
                    battVoltage = 0;//now that we have reading, clear it
                    //console.log("Batt Averaged and Corrected Value: " + global.Battery);

                    // ###########################################################################################################
                    // ###########################################################################################################

                    //convert to percentage of battery --- this is totally arbitrary - need to put in real life values from testing

                    // ###########################################################################################################
                    // ###########################################################################################################


                    if (global.Battery > 4) {
                        global.Battery = 100;
                    }
                    else if (global.Battery > 3.9) {
                        global.Battery = 90;
                    }
                    else if (global.Battery > 3.85) {
                        global.Battery = 75;
                    }
                    else if (global.Battery > 3.5) {
                        global.Battery = 50;
                    }
                    else if (global.Battery > 3.4) {
                        global.Battery = 25;
                    }
                    else if (global.Battery > 3.0) {
                        global.Battery = 10;
                    }
                    else if (global.Battery > 2.7) {
                        global.Battery = 5;
                    }
                    else if(global.Battery <=2.7){
                        global.Battery = 1;
                    }


                    //console.log("Battery Voltage: " + global.Battery);
                }


         }
    });
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


       // serialPort.write('TEST STRING SENDING\r')
        //serialPort.write("VLD# 1 65 1 0\r");
    });

    serialPort.on('data', function(data) {
      // console.log('*****************Serial Data Rec:'+data)
        if (global.demoMode){
            //console.log('Serial Data Ignored - in demo Mode')
            return;
        }
        if(data.length <=5){  //lets just assume this data is xbee module data andd not from cs4
           xbee.xbeeReceivedData(data); // send it to the xbee module
        }
        else {
            timeout = new Date();
            if (cb != null) {

                cb(data)
            }
        }
         //console.log('Serial Data:'+data);
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
    fs.readFile('settings', 'utf8', (err, filetxt) => {
        if (err) {  console.log('settings not found - going to settings menu')
            global.settings = {
                failedtoload: true,
                webServer: {
                    listenPort: 3111
                },
                webSocket: {
                    listenPort: 3112,
                    maxConnections: 10,
                    showConnectioninfo: false
                }
            }
            settings.availableSettings = getAvailableSettingsFiles(function(x){
                settings.availableSettings = x
            })
            addGlobalCounters();

            return callback();
        }
        //settings file loaded ok
        console.log(ll.ansi('inverse', 'Settings Loaded!'))
        global.settings = JSON.parse(filetxt);
        addGlobalCounters();
        moveStartupImages(); // copy the images over to where the need to be for startup


        return callback();




            });
}
function moveStartupImages() {
    if (os.type() != "Windows_NT") {
        if (settings.startupImages){
            fs.copyFile('./localImages/'+settings.startupImages.splash,'/etc/splash.png',(err) =>{
                if (err){
                    console.log('Error copying spash.png:'+err)
                }else {
                    console.log('splash copied')

                }

            })
            fs.copyFile('./localImages/'+settings.startupImages.logo,'/boot/logo.bmp',(err) =>{
                if (err){
                    console.log('Error copying logo.bmp:'+err)
                }else {
                    console.log('logo copied')

                }

            })

        }


    }
}

function addGlobalCounters(){
    global.settings.performance = {}
    settings.performance.startTime = new Date();
    settings.performance.cueCounter = {};
    settings.performance.cueCounter.total = 0;
    settings.performance.cueCounter.show = 0;
    settings.performance.cueCounter.jpg = 0;
    settings.performance.cueCounter.mp4 = 0;
    settings.performance.cueCounter.mp3 = 0;
    settings.performance.cueCounter.unhandled = 0;
    settings.performance.cueCounter.noGO = 0;
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
    console.log(ll.ansi('inverse','Software Version:'+pjson.version))

    // default wiz values go here
    global.wiz={
        Baudrate:115200,
        PanID:301,
        Scroll:'up',
        Backlight:80,
        FadeIn:1,
        FadeOut:2
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
    if (settings.ShowName != null){
        try {
            fs.accessSync(showPath+'/'+settings.ShowName+'/wiz.dat')
        } catch (err) {
            // the show.def is invalid
            settings.ShowName = null;
            console.log('show.def is not valid - ignoring')
            //if (err.code !== 'EEXIST') {throw err}

        }

    }

    getShowNames((showNames) =>{
        wiz.allShowsAvailable = showNames
        if (settings && !settings.ShowName) {
            settings.ShowName = showNames[0];
            console.log('because there is no show.def - the show  is set to first show found - ' + showNames[0]);
        }

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

        require('dns').lookup(require('os').hostname(), function (err, add, fam) {
            console.log('addr: '+add);
            ws.send(JSON.stringify({object:'unitStatus',data:{Battery:'NA',Pan:'NA',Signal:'NA',Temperature:'NA',MACAddress: 'NA'
                , IPAddress: add,
                firmwareVersion: pjson.version}}),'r6');

        });


        return;
    }
    var Battery;
    var Temperature;
    var Pan;
    fs.readFile(battADC, 'utf8', (err,filetxt) =>{
        if(err){
            console.log("Battery ERROR:  " + err);
        }
        else {
            console.log("Battery Voltage: "+ global.Battery);
        }



            fs.readFile(sysTemp, 'utf8', (err, filetxt) => {
                if (err) {
                    console.log("Temperature: " + err);
                }
                else {
                    console.log("Temperature: " + global.Temperature);
                }

                xbee.xbeeGetsignalStrength(0, 0, function (Sig) {
                    global.Sig= Sig;

                    xbee.xbeeGetPanID(0,0,function(Pan) {

                        global.Pan = Pan;
                        ws.send(JSON.stringify({object: 'unitStatus',
                            data: {
                                Battery: global.Battery,  //(parseInt(global.Battery)*.003310466).toFixed(2).toString(),//this is calculated:  .003381234
                                Pan: global.Pan,
                                Signal: global.Sig,
                                Temperature: global.Temperature,
                                IPAddress: global.myuri,
                                MACAddress: global.Mac,
                                firmwareVersion: pjson.version
                            }
                        }), 'r6');
                    });
                });

            });

       // });

    });
}

exports.backlight = function(value,direction){
    var delay =0;
    // console.log("AT backlight: "+ "value: "+ value + "Direction: " + direction);
    // clearTimeout(timerBacklightOn);
    // clearTimeout(timerBacklightOff);
    backlightLevel = value;
  // console.log("Backlight request: " + backlightLevel + "  direction is: " + direction  );

    if(direction == 'up'){
        backLightUp();
       // backlightLevel +=1;
       //  if(backlightLevel > wiz.Backlight*backlightNanoPiMax/100){//on startup level is max so turn it down to where it belongs
       //      backlightLevel = wiz.Backlight*backlightNanoPiMax/100;
       //  }
       //  if(backlightLevel < wiz.Backlight*backlightNanoPiMax/100){
       //      delay = 5*wiz.FadeIn*(Math.pow(10000,1/(backlightLevel+1)));//was 10
       //      if(delay > 4000){
       //          delay = 250;
       //      }
       //      timerBacklightOn = setTimeout(function(){exports.backlight(backlightLevel, "up")},delay );
       //  }
    }
    else if(direction == 'down'){
        backLightDown();
        // backlightLevel -=1;
        // if(backlightLevel > 0){
        //     Delay = 5* wiz.FadeOut*Math.exp(1/(backlightLevel+1));
        //
        //     timerBacklightOff = setTimeout(function(){exports.backlight(backlightLevel, "down")},Delay); // was 10
        // }
    }

    if(os.type() != "Windows_NT") {//don't do this on windows
        if(backlightLevel <0){
            return;
        }

        fs.writeFile('/dev/backlight-1wire', backlightLevel, (err) => {
            if (err) {
                console.log("error in writing to backlight " + "error: "+ err +  " backlightlevel: "+ backlightLevel  );
            }
            else {
             //   console.log('The backlight value is now: ' + backlightLevel);
            }
        });
    }
};

exports.backlightOn = function(value){
  //  console.log("just arrived at backlight up")
  //  clearTimeout(timerBacklightTime); // already going off, so clear this timer
    clearTimeout(timerBacklightOn);
    clearTimeout(timerBacklightOff);
    for(var i = 0; i<=steps; i++) {
        clearTimeout(timerBacklightDown[i]);
        clearTimeout(timerBacklightUp[i]);
    }
    if(value !=null){
        exports.backlight(value*backlightNanoPiMax/100); // if no parameter just turn on backlight to the percentage indicated in value
    }
    else {  //called without a value
        exports.backlight(backlightLevel,"up");
      //  timerBacklightTime = setTimeout(function () {exports.backlightOff()}, wiz.OnTime * 10000);// set the timer to time things out and turn off
    }
};

exports.backlightOff = function(){
  //  console.log("just arrived at backlight DOWN");
  //  clearTimeout(timerBacklightTime); // already going off, so cleat this timer
    clearTimeout(timerBacklightOn);
    clearTimeout(timerBacklightOff);
    for(var i = 0; i<=steps; i++) {
        clearTimeout(timerBacklightDown[i]);
        clearTimeout(timerBacklightUp[i]);
    }
    exports.backlight(backlightLevel,"down");
};

function backLightDown(){

  //  console.log(wiz.Backlight + "  "+ backlightNanoPiMax);
    exponent = (Math.log(wiz.Backlight*backlightNanoPiMax/100))/(Math.log(logBase)); //find exponent of max value
//    console.log("exponent: " + exponent);

    for (var i = 0; i < steps; i++){
        fadeoutTime[i] = i*wiz.FadeOut*1000/(steps-1) +1;
         value[i]  = (Math.pow(logBase,exponent - i*exponent/(steps-1))-1).toFixed(0);
           // timerBacklightDown[i] = setTimeout(function () {exports.backlight(value[i]);}, fadeoutTime);
        timerBacklightDown[i]=   setTimeout(exports.backlight, fadeoutTime[i], value[i]);
         //   console.log("calc: " + i + " value: " + value[i] + " time delay: " +fadeoutTime[i] + " Wiz.Fadeout: " + wiz.FadeOut);
    }

}
 function backLightUp(){

    // console.log(wiz.Backlight + "  "+ backlightNanoPiMax);
     exponent = (Math.log(wiz.Backlight*backlightNanoPiMax/100))/(Math.log(logBase)); //find exponent of max value
  //   console.log("exponent: " + exponent);

     for (var i = 0; i <= steps; i++){
         fadeoutTime[i] = i*wiz.FadeIn*1000/(steps-1) +1;
         value[i]  = (Math.pow(logBase,exponent -(steps- i)*exponent/(steps))+.5).toFixed(0) ;
         // timerBacklightDown[i] = setTimeout(function () {exports.backlight(value[i]);}, fadeoutTime);
         timerBacklightUp[i]=   setTimeout(exports.backlight, fadeoutTime[i], value[i]);
     //    console.log("calc: " + i + " value: " + value[i] + " time delay: " +fadeoutTime[i] + " Wiz.Fadeout: " + wiz.FadeOut);
     }

 }

exports.wifiCheck = function(){
    if (!wiz.Ssid || wiz.Ssid == 'undefined'){
        console.log(ll.ansi('inverse', 'No wiz ssid found '));
        exports.getIPAddres();
        return

    }
    console.log(ll.ansi('inverse', 'wifi reconnect:'+wiz.SSid));

    try{
        fs.unlinkSync('/etc/NetworkManager/system-connections/show')
    } catch(err){
        console.log(err)
    }
    require('child_process').exec('nmcli device wifi connect '+wiz.Ssid+' password "'+wiz.Pass+'" name show', function (err, resp) {
        setTimeout(function(){exports.getIPAddres()}, 10000);// wait 5 seconds and then get ip address
        console.log(err)
        console.log(resp)
    });


}
// exports.wifiCheckold = function(){
//     var currentSSID;
//     var currentPASSWORD;
//     if(wiz.Ssid == null){
//         wiz.Ssid = "None";
//     }
//     if(wiz.Pass == null){
//         wiz.Pass = "None";
//     }
//     wiz.Ssid = wiz.Ssid.trim();
//     wiz.Pass = wiz.Pass.trim();
//     console.log("wiz.ssid " + wiz.Ssid + " length "+ wiz.Ssid.length);
//     console.log("wiz.Pass "+ wiz.Pass + " length " + wiz.Pass.length);
//     const rl = readline.createInterface({
//         input: fs.createReadStream('/etc/wpa_supplicant/wpa_supplicant.conf')
//     });
//
//     rl.on('line', (line) => {
//         console.log(line);
//         if(line.includes("ssid")){
//             currentSSID=line.substring(line.lastIndexOf("ssid=")+6,line.lastIndexOf('"')).trim();
//             //console.log("current ssid: "+ currentSSID  + " length: " + currentSSID.length );
//         }
//         if(line.includes("psk")) {
//             currentPASSWORD = line.substring(line.lastIndexOf("psk=") + 5, line.lastIndexOf('"')).trim();
//             //console.log("current Password: "+ currentPASSWORD + " length: " + currentPASSWORD.length);
//         }
//
//     });
//     rl.on('close',()=> {
//         //console.log("End of File")
//
//         if((currentSSID == wiz.Ssid) && (currentPASSWORD == wiz.Pass)){
//             exports.getIPAddres()
//             //console.log("there is nothing in wifi that needs to be changed");
//         }
//         else{ // wiz.dat access point or passwords dont match settings
//             getAccessPoints(function(accessPointList){
//                 if(accessPointList.indexOf(wiz.Ssid) == -1){
//                     exports.getIPAddres()
//                     console.log(ll.ansi('inverse', 'Access Point Not Found:'+wiz.SSid));
//                     return;
//
//                 }
//
//                 console.log("Changing Wi-Fi settings");
//                 fs.readFile('/etc/wpa_supplicant/wpa_supplicant.conf', 'utf8', function (err,data) {
//                     if (err) {
//                         console.log(err);
//                         return
//                     }
//                     var result = data.replace(currentSSID, wiz.Ssid);
//                     result = result.replace(currentPASSWORD, wiz.Pass);
//                   // //  fs.writeFile('/etc/wpa_supplicant/wpa_supplicant.conf', result, 'utf8', function (err) {
//                   //       if (err) {
//                   //           console.log(err);
//                   //           return
//                   //       }
//
//                         console.log("Wi-FI settings config file updated")
//
//                     });
//
//                     execSeries(['sudo /sbin/ifdown wlan0'], (err, stdouts, stderrs) => {//
//                         if (err) {
//                             console.log(err);
//                             throw err;
//                         }
//
//                         console.log(stdouts); // yields: ['foo\n', 'bar\n']
//                         console.log(stderrs); // yields: ['', '']
//                         execSeries(['sudo /sbin/ifup wlan0'], (err, stdouts, stderrs) => {//
//                             // execSeries(['sudo  -u fa  /sbin/ifup wlan0'], (err, stdouts, stderrs) => {//
//                             setTimeout(function(){exports.getIPAddres()}, 20000);// wait 20 seconds and then get ip address
//                             if (err) {
//                                 console.log(err);
//                                 throw err;
//                             }
//
//                             console.log(stdouts); // yields: ['foo\n', 'bar\n']
//                             console.log(stderrs); // yields: ['', '']
//                         });
//                     });
//
//
//             })
//
//
//         }
//
//
//     });
// }
function getAccessPoints(cb){
//used
    require('child_process').exec('iwlist wlan0 scan | grep "ESSID"', function (err, resp) {
        console.log(resp)
        var rv = resp.replace(/ESSID:/g,'')
        rv = rv.split('\n')
        for (var i=0;i<rv.length;++i){
            rv[i] = rv[i].trim().replace(/"/g,'');

        }
        return cb(rv)

    });
}

exports.wifiandPanIdcheckandset= function(){
    if(os.type() != "Windows_NT") {//dont do this on windows!
        exports.wifiCheck();
        xbee.xbeeGetPanID(0, 0, function (Pan) {
            wiz.PanID = wiz.PanID.trim();
            Pan = Pan.trim();
            console.log("PAN ID Want: " + wiz.PanID + " Have: " + Pan + " Pan Id Want length: "+ wiz.PanID.length+ " Have Length: " + Pan.length);
            if(wiz.PanID) {
                if ((Pan != wiz.PanID) && (wiz.PanID.length > 3)) {//if the pan id is not the one we want then change it // and make sure tha there is a valid panID
                    console.log("changing Pan ID");
                    setTimeout(function () {
                        xbee.xbeeSetPanID(0, 0, wiz.PanID)
                    }, 1600);
                }
            }
        });


    }}

function getMACAddress(cb){
    if(os.type() != "Windows_NT") {//dont do this on windows!
        fs.readFile(macAddress, 'utf8', (err,filetxt) => {
            if (err) {
                console.log("MAC ERROR - trying wlan1:  " + err);
                fs.readFile(macAddress2, 'utf8', (err,filetxt) => {
                    if (err) {
                        console.log("MAC ERROR:  " + err);
                    }
                    else {
                        global.Mac = filetxt.replace(/[\n\r]/g, '');
                        console.log("Mac Address: " + global.Mac);
                        cb()
                    }
                });
            }
            else {
                global.Mac = filetxt.replace(/[\n\r]/g, '');
                console.log("Mac Address: " + global.Mac);
                cb()

            }
        });
    }else
    {
        const exec = require('child_process').exec;
        exec('getmac', function (err, stdout, stderr) {
            if (!err) {
                var temp = stdout.split(' ');
                global.Mac = temp[51].substring(temp[51].length - 17, temp[51].length).split('-').join(':');
                console.log("Mac Address: " + global.Mac);
                cb()
            }
            else {
                console.log('Some error occurred in getting MAC ', err, stderr);
                return cb()
            }
        })


    }

}
exports.getIPAddres = function(){
    //iterate through all of the system IPv4 addresses
    // we should connect to address[0] with the webserver
    //so lets grab it and make a global variable to
    //use elseware
    console.log("We are at getIPAddresses");
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
    console.log('My IP Address 0 is: ' + global.myuri );
}

exports.dirToObject = function(show,cb){
    var o = {} // this is the show object
    getWiz(show,function(w){ // get this show info from wiz
        if (w.Version == -1) { // returned false
            cb(false);
            return;
        }
        console.log('Local:' +show+' file version:'+w.Version)
        // get list of services
            o.show = w.ShowName;
            o.version = w.Version;
            var services = [];
            for (var key in w) {
                if (key.indexOf('Service') == 0  ){
                    services.push(w[key])
                }
            }
         //   o.services = services;
            console.log('Local: Found '+services.length+' services:'+services);
            // now scan the services:
            for (var i=0;i<services.length;++i){
                try {
                    var dir = fs.readdirSync('public/show/'+show+'/'+services[i])
                } catch (err) {
                    continue;
                }

                var stat;
                var path;
                console.log('Local:' +services[i]+' - files:'+dir.length);

                for (var j=0;j<dir.length;++j){
                    path = show+'/'+services[i]+'/'+dir[j]
                    stat = fs.statSync('public/show/'+path)
                    if (!stat.mtimeMs){stat.mtimeMs = Date.parse(stat.mtime)}
                    //console.log(JSON.stringify(stat))
                    o[path] = {};
                    o[path].name = dir[j];
                    o[path].size = stat.size;
                    o[path].lastModified = Math.trunc(stat.mtimeMs);
                }
            }
            // also add wiz.dat and Welcome.jpg

        path = show+'/wiz.dat';
        stat = fs.statSync('public/show/'+path);
        if (!stat.mtimeMs){stat.mtimeMs = Date.parse(stat.mtime)}
        o[path] = {};
        o[path].name = 'wiz.dat';
        o[path].size = stat.size;
        o[path].lastModified = Math.trunc(stat.mtimeMs);


        path = show+'/Welcome.jpg';
        stat = fs.statSync('public/show/'+path);
        if (!stat.mtimeMs){stat.mtimeMs = Date.parse(stat.mtime)}
        o[path] = {};
        o[path].name = 'Welcome.jpg';
        o[path].size = stat.size;
        o[path].lastModified = Math.trunc(stat.mtimeMs);

        cb(o)

    })
}
exports.compareFiles = function(local,remote,cb){
    const maxChunkSize = 5000*1024
    var changeList = [];
  var filesToTransfer = 0;
  var filesToDelete = 0;
  var bytesToTransfer = 0;
    for (r in remote) { // scan the remote object
        if (r == 'show' || r == 'version')
        {
            continue;
        }

        if (local[r] == null){

            addToChangelist('New');
            //changeList.push({name:r,action:'get',size:remote[r].size,reason:'New' })
            ++filesToTransfer;
        } else
        {
            if (Math.trunc(local[r].lastModified/1000)  != Math.trunc(remote[r].lastModified/1000)){

                addToChangelist('Date');
                //changeList.push({name:r,action:'get',size:remote[r].size,reason:'Date',local:local[r].lastModified,remote:remote[r].lastModified })

                ++filesToTransfer;
            } else
            {
                if (local[r].size  != remote[r].size){

                    addToChangelist('Size');
                    //changeList.push({name:r,action:'get',size:remote[r].size,reason:'Size' })
                    ++filesToTransfer;
                }
            }
        }

        }
    for (l in local) { // scan the remote object
        if (l == 'show' || l == 'version')
        {
            continue;
        }

        if (remote[l] == null){ // file deleted

            changeList.push({name:l,action:'delete',reason:'Old' })
            ++filesToDelete;
        }

    }

    // console.log(JSON.stringify(changeList,null,4))

    cb({changeList:changeList,filesToTransfer:filesToTransfer,filesToDelete:filesToDelete,bytesToTransfer:bytesToTransfer});

    function addToChangelist(reason){
        // this function adds the file to the to-get list
        // and also splits the file up to the right size chuncks
       var counter = 0;
       var chunks = Math.trunc(remote[r].size/maxChunkSize)+1
        bytesToTransfer += remote[r].size;
        if (remote[r].size > maxChunkSize){
            for (var x=0;x<remote[r].size;x=x+maxChunkSize){
                ++counter
                changeList.push({
                    name:r,
                    action:'get',
                    size:((x+maxChunkSize>= remote[r].size)?remote[r].size-x:maxChunkSize),
                    reason:reason+'('+counter+'/'+chunks+')',
                    split:true,
                    start:x,
                    length:maxChunkSize,
                    last: ((x+maxChunkSize>= remote[r].size)?true:false),
                    first: ((x == 0)?true:false)
                })

            }
        }else
        {
            changeList.push({name:r,action:'get',size:remote[r].size,reason:reason })
        }

    }
}

exports.getFilesFromList = function (l){
   fileListCounter = 0;
   list =  l;

    getNextFile()


}
function getNextFile() {

    switch(list[fileListCounter].action ){
        case'delete':

            fs.unlink(showPath+list[fileListCounter].name,function(e){
                if (e){
                    console.log('delete error:'+e)
                } else {
                    exports.gotFile(list[fileListCounter].name)
                }

            })
            break;
        case'get':
            ws.send(JSON.stringify({object:'getFile',file:list[fileListCounter]}),'updateunit');
            global.getFileRetries = 0;
            global.getFileTimeout = setInterval(function(){
                ws.send(JSON.stringify({object:'getFile',file:list[fileListCounter]}),'updateunit');
                ++global.getFileRetries
                console.log('Failed to recieve File:'+list[fileListCounter].name+' Retries:'+global.getFileRetries)
                if (global.getFileRetries > 5){
                    clearInterval(global.getFileTimeout);
                }
            },30000)
            break;


    }





    // setTimeout(function () {
    //         gotFile(list[fileListCounter].name)
    //     }, 1000)


}
exports.gotFile = function(filename){
    // this is used for browser to unit file transfer
    if (filename == list[fileListCounter].name){
        clearInterval(global.getFileTimeout);
        if (list[fileListCounter].action == 'get'){
            ws.send(JSON.stringify({object:'updateFileTransfer',text:'('+fileListCounter+'/'+list.length+')'+list[fileListCounter].name+' - File Transfered'}),'updateunit');
        } else {
            ws.send(JSON.stringify({object:'updateFileTransfer',text:'('+fileListCounter+'/'+list.length+')'+list[fileListCounter].name+' - Unused File Removed'}),'updateunit');
        }


        if (fileListCounter < list.length - 1) {
            ++fileListCounter
            getNextFile();
        } else {
            exports.getShowVersions(function(x){
                ws.send(JSON.stringify({object:'updateStatus',text:'All Files Received - UPLOAD Complete'}),'updateunit');

                ws.send(JSON.stringify({object:'uploadComplete'}),'updateunit');


                console.log('Old Show Versions:')
                console.log(JSON.stringify(global.settings.showVersion,null,4))
                global.settings.showVersion= x
                console.log('New Show Versions:')
                console.log(JSON.stringify(global.settings.showVersion,null,4))

                console.log('All Files Received - Operation Complete');
            })


        }
    }else{
        console.log('wrong file rec'+filename+':'+list[fileListCounter].name)
    }


}
exports.getShowFrom = function(show,ip,cb){
    // used for unit to unit - this is the requesting unit
    ip = ip +':'+ global.settings.webSocket.listenPort;
    console.log('Requesting Show:'+show+' from:'+ip);
    global.updatingUnit = true;
    var showDirectoryCreated= false; //reset the show creation directoy flag
    var lastDirectory = ''
    var listCounter = 0;
    var list;
    var getFileStalledTimeout;
    const showPath = 'public/show/' // also in llibR6

    exports.dirToObject(show,function(localFiles){
        // first get local version of show to update
        if (!localFiles){localFiles={}}; // if its a new show

           var ws = new WebSocket('ws://'+ip)

            ws.on('open', function open() {
                console.log('connected to remote server')

                // 2nd - connect to the remote unit and get its file list
                ws.send(JSON.stringify({type:'getfiles',data:localFiles,show:show}));

            });

            ws.on('message', function incoming(data) {
                data = JSON.parse(data);
                switch(data.type) {
                    case "remoteFileInfo":
                        // 3rd got remote file info back from remote now compare the files
                        var remoteFiles = data.remoteFiles
                        console.log('received file info for show:'+show+' from:'+ip)

                        ll.compareFiles(localFiles,remoteFiles,function(rslt) {
                            list = rslt.changeList;
                            // 4th - compared the files and have the change list
                            console.log('Files To Transfer:'+rslt.filesToTransfer);
                            console.log('Files To Delete:'+rslt.filesToDelete);
                            listCounter=0;

                      // console.log(JSON.stringify(list,null,4))
                            // this could error if it was a type delete
                            ws.send(JSON.stringify({type:'getfile',file:list[listCounter],
                                status:{
                                    complete:listCounter/list.length,
                                    mac:global.global.Mac,
                                    show:show

                                }}));

                        })
                        break;
                    case "file":
                        // received the file requested back from the reomte unit - now write
                        var file = data.file
                            // make sure the show directory is there
                        if (!showDirectoryCreated){
                            showDirectoryCreated = true;
                            try {
                                fs.mkdirSync(showPath+file.relativePath.substr(0,file.relativePath.indexOf('/')))
                            } catch (err) {
                                if (err.code !== 'EEXIST') {throw err}

                            }
                        }
                        //check the show directory has changed
                        var s0 = file.relativePath.indexOf('/');
                        var s1 = file.relativePath.lastIndexOf('/');
                        if (s0 != s1){ // contains a service path

                            var servicePath = file.relativePath.substr(0,s1+1)
                            if (lastDirectory != servicePath){
                                // make sure the new directory (service) path is there
                                console.log('checking directory:'+servicePath)
                                lastDirectory = servicePath;
                                try {
                                    fs.mkdirSync(showPath+servicePath)
                                } catch (err) {
                                    if (err.code !== 'EEXIST') {throw err}
                                }


                            }

                        }
                        if (!file.split || file.first){
                            // single part file or first part of a split file

                            fs.writeFile(showPath+file.relativePath, file.data, 'base64', function(err) {
                                if (err){
                                    console.log(err);
                                }
                                process.stdout.write('-');
                                if (!file.split){ // no need to update the file if its a split file
                                    updateUtimes();
                                } else
                                {
                                    filerec(file.relativePath)
                                }

                            })

                        } else {
                            // split file - add these pieces to the file
                            fs.appendFile(showPath+file.relativePath, file.data, 'base64', function(err) {
                                if (err){
                                    console.log(err);
                                }
                                process.stdout.write('*');
                                if (file.last){ // update the file date when split file is complete
                                    updateUtimes();
                                } else {
                                    filerec(file.relativePath)

                                }

                            })


                        }


                    function updateUtimes(){
                           // update the last modified time of a file

                        fs.utimes(showPath+file.relativePath,file.lastModified/1000,file.lastModified/1000,function(err){
                            if (err){console.log('error:'+err);}

                            //        process.stdout.write(((file.split)?'*':'.'))
                            filerec(file.relativePath)
                        })


                    }

                        //data.file.data //base64 encoded

                        break;
                    default:
                        console.log('unknown type:'+data.type)
                }

                });
            ws.on('close',function(){
                global.updatingUnit = false;
                console.log('websocket closed')

                global.updatingUnit = false;
                if (global.updatingUnit == true){
                    cb({error:'websocket closed'})
                }
                global.updatingUnit = false;


            })
            ws.on('error', function (err) {
                    console.log('Error - websocket client:'+err);
                global.updatingUnit = false;

                cb({error:err})

            });
        function filerec(filename){
            // got the requested file (or chunk) and wrote it - now get the next file on the list
            if (filename == list[listCounter].name){
                // clear the retry timer
                clearTimeout(getFileStalledTimeout);
                if (list[fileListCounter].action == 'get'){
                   // console.log('Got File:'+list[listCounter].name+':'+list[listCounter].reason)
                } else {
                 //   console.log('Deleted File:'+list[listCounter].name+':'+list[listCounter].reason)
                    process.stdout.write('X');

                }

                if (listCounter < list.length - 1) {
                    ++listCounter


                   if (list[listCounter].action == 'get'){
                       ws.send(JSON.stringify(
                           {
                               type:'getfile',
                               file:list[listCounter],
                               status:{
                                   complete:listCounter/list.length,
                                   mac:global.global.Mac,
                                   show:show

                               }
                               }
                           ));
                       // set a timer to abort the process if a file is not received
                       // this one is a little different than the browser to unit transfer
                       // we will just abort the process and wait for the next beacon to come in
                       // the last show we write is the version so it will still report the from version
                       // and continue with the rest of the files

                       getFileStalledTimeout=setTimeout(function(){
                           console.log('Update stalled - will retry next beacon')
                           global.updatingUnit = false;
                       },15000)
                    } else
                   {
                       fs.unlink(showPath+list[listCounter].name,function(e){
                           if (e){
                               console.log('delete error:'+e)
                           } else {
                                console.log('file deleted')
                               filerec(list[listCounter].name)
                           }

                       })

                   }

                } else {

                    exports.getShowVersions(function(x){
                        console.log('Old Show Versions:')
                        console.log(JSON.stringify(global.settings.showVersion,null,4))
                        global.settings.showVersion= x
                        console.log('New Show Versions:')
                        console.log(JSON.stringify(global.settings.showVersion,null,4))

                        console.log('All files recieved');

                        global.updatingUnit = false;
                        ws.send(JSON.stringify(
                            {
                                type:'transferComplete',
                                status:{
                                    complete:100,
                                    show:show,
                                    mac:global.global.Mac,
                                    finished:true
                                }
                            }
                        ));

                        ws.close();
                    })

                }
            }else{
                console.log('wrong file rec'+filename+':'+list[fileListCounter].name)
            }

        }

        })

}
function udp()
{

    process.stdout.write('UDP server started and listening \n')
    const dgram = require('dgram');
    const udpSocket = dgram.createSocket({type:'udp4',reuseAddr:true});
    udpSocket.on('error', (err) => {
        console.log(`server error:\n${err.stack}`);
        udpSocket.close();
    });

    udpSocket.on('message', (msg, rinfo) => {
        var message = JSON.parse(msg);
        var fromAddress = rinfo.address;
        switch(message.type){
            case"showVersion": // this is an advertisement from a master unit - indication all of its show versions
                // make sure global.settings.showVersion is there before comparing
                if (!global.updatingUnit && global.settings && global.settings.showVersion){
                    for (show in message.showVersion) { // scan the remote object
                        // compare versions
                        if (message.showVersion[show] > global.settings.showVersion[show] || global.settings.showVersion[show] == undefined)  {


                            console.log('Show Update Required:' + show + ' Remote Version:' + message.showVersion[show] +
                                ' Local Version:' + global.settings.showVersion[show])
                            console.log('Starting Update')
                            ll.getShowFrom(show,fromAddress,function(o){
                                console.log(JSON.stringify(o,null,4))

                            })
                            break;
                        }
                    }


                }
                break;

            case "requestStatusBeacon":  // a request from a master unit asking for the status beacon
                statusBeacon();
                break;

            case "statusBeacon":
                // received a status beacon from another unit
                // this doesn't start an update - it only compares the other units shows
                // to its shows and forward this diff to the web browser
                // only need to do this if a web browser is connected and on the page update unit

                process.stdout.write('s');

                if (ws.webpageConnected('updateunit') ) {
                    // lets compare the show versions here to see if there are any diffs
                    process.stdout.write('S');

                    var showDiff = {};
                    var willSync = 0;
                    var willNotSync = 0;
                    message.data.time = new Date();
                    if (message.data.MACAddress == global.Mac){
                        message.data.masterunit = true;
                    }
                    for (x in message.data.showVersions) {
                        if (!global.settings.showVersion[x] ) {
                            // version doesn't exist on master
                            showDiff[x] ={};
                            showDiff[x].version = message.data.showVersions[x];
                            showDiff[x].reason = 'Not on Master'
                            willNotSync++;
                            continue;
                        }

                        if (global.settings.showVersion[x] == message.data.showVersions[x]) {
                            // versions are the same
                            continue;
                        }
                        if (global.settings.showVersion[x] > message.data.showVersions[x]) {
                            showDiff[x] ={};
                            showDiff[x].version = message.data.showVersions[x];
                            showDiff[x].reason = 'Older than Master'
                            willSync++;
                            continue;
                        }
                        if (global.settings.showVersion[x] < message.data.showVersions[x]) {
                            showDiff[x] ={};
                            showDiff[x].version = message.data.showVersions[x];
                            showDiff[x].reason = 'Newer than Master'
                            willNotSync++;
                            continue;
                        }

                    }
                    for (x in global.settings.showVersion) {
                        if (!message.data.showVersions[x] ) {
                            showDiff[x] ={};
                            showDiff[x].version = global.settings.showVersion[x];
                            showDiff[x].reason = 'Not on this Unit'
                            willSync++;

                        }
                    }
                    delete message.data.showVersions;
                    message.data.willSync = willSync;
                    message.data.willNotSync = willNotSync;
                    message.data.showDiffs = showDiff;
                ws.send(JSON.stringify({object: 'statusBeacon',data: message.data }), 'updateunit');
                    //console.log(fromAddress+' Diffs:'+JSON.stringify(showDiff,null,4))


                }
                    break;
                default:
                    console.log('Unknow message type from udpSocket:' + message.type)


        }
    });

    udpSocket.on('listening', () => {
        udpAddMembership(function(err){

            console.log("UDP Socket Address:"+udpSocket.address().address);


        })


    });

    udpSocket.bind(41235);

    function udpAddMembership(cb){

        setTimeout(function(){
            try {
                udpSocket.addMembership('224.1.1.1');
            } catch (err){
                if (err == 'ENODEV'){
                    ('UDP add membership fail - retry in 5')
                    udpAddMembership(cb)
                 }

            }
            return cb()


        },5000)



    }
}

function getWiz(show,cb,path){
    if (!path){
        path = './public/show/';
    }
    try{
        fs.accessSync(path+show+'/wiz.dat')
    }catch(e){
        console.log(path+show+'/wiz.dat does not exist')
        cb({Version: -1})
        return;
    }

    rv = {};


    const rl = readline.createInterface({
        input: fs.createReadStream(path+show+'/wiz.dat')
    });

    rl.on('line', (line) => {
        if (line.indexOf(':') != -1){ // make sure there is a :
            // update the global.wiz object
            //global.wiz[line.substr(0,line.indexOf(':'))]=line.substr(line.indexOf(':')+1).replace(' ','');
            rv[line.substr(0,line.indexOf(':'))]=line.substr(line.indexOf(':')+1).trim();

        } else
        {
            console.log('Invalid line colon not found - ignoring:'+line);
        }
    });
    rl.on('close',()=> {
        // add a list of available shows to wiz
        if (cb){cb(rv);}
    })
    rl.on('error',(e)=> {
        console.log('error:'+e)
    })
}

function getShowNames(cb,path) {
    if (!path){
        path = './public/show/';
    }
    fs.readdir(path, (err, data) => {
        console.log(err)
        var shownames = [];
        console.log(data)
        data.forEach(function (data) {
            if (fs.lstatSync(path + data).isDirectory()) {
                //console.log('Show found:' + data)
                shownames.push(data);
            }
        })
        shownames.sort();
        if (cb){cb(shownames)}
    })
}
function getAvailableSettingsFiles(cb) {
    fs.readdir('./', (err, data) => {
        var shownames = [];

        data.forEach(function (data) {
            if (data.substr(0,9) == 'settings.') {
                shownames.push(data);
            }
        })
        shownames.sort();
        if (cb){cb(shownames)}
    })
}
exports.getShowVersions = function(cb,path){
    //console.log('getshowversions:'+path)
    var rv = {}
    getShowNames((shows)=>{
    var i = 0;
    getVersion()
    function getVersion(){

        getWiz(shows[i],function(wiz){
            rv[shows[i]] = wiz.Version
            if (i < shows.length-1 ){
                ++i
                getVersion()
            } else
            {
                cb(rv)
            }
        },path)
    }


    },path)
 }
function statusBeacon(){

    const dgram = require('dgram');
    setTimeout(function(){

        if(os.type() != "Windows_NT") {
            // get free space
            // Filesystem      Size  Used Avail Use% Mounted on
            // /dev/mmcblk0p2  7.2G  3.2G  4.0G  45% /

            require('child_process').exec('df -h /', function (err, resp) {
                global.freeSpace =100-resp.substr(resp.lastIndexOf('%')-4,4)

            });
        }




        const socket = dgram.createSocket({type:'udp4',reuseAddr:true});
        var beacon = {
            type:'statusBeacon',
            data: {
                Battery: global.Battery, //(parseInt(global.Battery)*.003310466).toFixed(2).toString(),//this is calculated:  .003381234
                Pan: global.Pan,
                Signal: global.Sig,
                Temperature: global.Temperature,
                IPAddress: global.myuri,
                MACAddress: global.Mac,
                firmwareVersion: pjson.version,
                freeSpace: global.freeSpace,
                showVersions:global.settings.showVersion,
                performance:global.settings.performance
            }
        }
        socket.send(JSON.stringify(beacon),41235,'224.1.1.1',(err) =>{
            socket.close();
        });
    },Math.random()*1500) // delay a random amount before transmiting - just in case

}
exports.copyFromUsb = function(s){
    switch (s){
        case "0":
            ws.send(JSON.stringify({object:'loadMain'}),'r6');
            break;
        case "1":
            require('child_process').exec('rm -rf ./public/show', function (err, resp) {
                linuxCopyDirectory('/media/usb0/show',  './public',function(){
                    ws.send(JSON.stringify({object:'finished'}),'r6');
                })

                // require('child_process').exec('cp -R /media/usb0/show  ./public/', function (err, resp) {
                //     console.log(err)
                //     ws.send(JSON.stringify({object:'finished'}),'r6');
                //
                //
                // });
            });

            break;
        case "2":
           // require('child_process').exec('cp -R /media/usb0/show  ./public/', function (err, resp) {
                linuxCopyDirectory('/media/usb0/show',  './public',function(){

                    ws.send(JSON.stringify({object:'finished'}),'r6');


                })




            break;
        case "3":
            copyUsbNewer();
            break;
    }

};
function copyUsbNewer(){
  //  const source = 'c:/level451/usbsim';
  //  const destination = './public/show/';
      const source = '/media/usb0/show/';
      const destination = './public/show/';

    exports.getShowVersions(function(sourceShows){
        console.log(JSON.stringify(sourceShows,null,4))


        exports.getShowVersions(function(destinationShows){
            console.log(JSON.stringify(destinationShows,null,4))
            // compare the versions.
            var showsToGet = []
            for (var sourceShow in sourceShows){
                if (destinationShows[sourceShow] == null){
                    console.log('Show '+sourceShow+' not on Unit - Copying')
                    showsToGet.push(sourceShow)

                } else
                {
                    if (sourceShows[sourceShow] > destinationShows[sourceShow]){
                        console.log('Show '+sourceShow+' NEWER than on Unit - Copying')
                        showsToGet.push(sourceShow)


                    } else
                    {
                        console.log('Show '+sourceShow+' NOT newer - ignoring')


                    }
                }





            }
            console.log('files to get:'+showsToGet);
            if (showsToGet.length > 0){
                global.listPointer = 0
             linuxCopyDirectoryList(source,destination,showsToGet)
            } else {
                console.log('nothing to copy - nothing copied')
                ws.send(JSON.stringify({object:'finished'}),'r6');

            }



        },destination)


    },source)


}
exports.test = function(){
    copyUsbNewer();
}
function linuxCopyDirectoryList(source,destination,list){

    if (list.length <= global.listPointer){
        console.log('USB FINISHED')
        ws.send(JSON.stringify({object:'finished'}),'r6');
        return;
    }
    console.log('USB Copy - working on '+list[global.listPointer])
    linuxCopyDirectory(source+list[global.listPointer],destination,function(){
    //    linuxCopyDirectory(source+list[global.listPointer],destination+list[global.listPointer],function(){
        console.log('USB Copy - finished '+list[global.listPointer])
        ++global.listPointer
        linuxCopyDirectoryList(source,destination,list)


    })



}
function linuxCopyDirectory(source,destination,cb){
    console.log(source)
    console.log(destination)
    const { spawn } = require('child_process');
    const ls = spawn('rsync', ['-a', '--progress',source,destination]);

    ls.stdout.on('data', (data) => {
        data=data.toString();
        //console.log(data)

        if (data.indexOf('xfr#')!= -1){
        //   console.log('-------'+data.indexOf('xfr#'))
            //console.log(data.substring(data.indexOf('ir-chk=')+7,data.indexOf(')')))
         //   ws.send(JSON.stringify({object:'status',status:"Working - "+data.substring(data.indexOf('ir-chk=')+7,data.indexOf(')'))}),'r6');
            ws.send(JSON.stringify({object:'status',status:"Working - "+data.substring(data.indexOf('xfr#'),7,data.indexOf(')'))}),'r6');

        }

        //console.log(`stdout: ${data}`);
    });

    ls.stderr.on('data', (data) => {


        console.log(`stderr: ${data}`);
    });

    ls.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        return cb()
    });

}