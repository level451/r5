const debug = 1;
const showPath = 'public/show/' //also in websocket

console.log = (function () {return function (x) {if (debug) {process.stdout.write(ll.ansitime('magenta','llib     ') + x + '\n');}}})();
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
const macAddress = "/sys/class/net/wlan0/address"; // this is for nanopi 2
global.testMode = false;
global.demoMode = false;
var timerBacklightOn;
var timerBacklightOff;
var timerBacklightTime;
var backlightLevel = 0;
var backlightNanoPiMax = 100;
if(os.type() != "Windows_NT") {
    var com = require('serialport');
    var execSeries = require('exec-series');
}

udp(); // start the udp server
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
            console.log('Serial Data Ignored - in demo Mode')
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
    console.log('Software Version:'+pjson.version)

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


    getShowNames((showNames) =>{
        wiz.allShowsAvailable = showNames
        if (settings && !settings.ShowName) {
            settings.ShowName = showNames[0];
            console.log('because there is no show.def - the show  is set to first show found - ' + data);
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
                                Battery: (parseInt(global.Battery)*.003310466).toFixed(2).toString(),//this is calculated:  .003381234
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
    var delay;
    backlightLevel = value;
//    console.log("Backlight request: " + backlightLevel + "  direction is: " + direction + " delay is: "+  wiz.FadeIn*(Math.pow(10000,1/(backlightLevel+1))) );

    if(direction == 'up'){
       backlightLevel +=1;
        if(backlightLevel < wiz.Backlight*backlightNanoPiMax/100){
            delay = 5*wiz.FadeIn*(Math.pow(10000,1/(backlightLevel+1)));//was 10
            if(delay > 4000){
                delay = 250;
            }
            timerBacklightOn = setTimeout(function(){exports.backlight(backlightLevel, "up")},delay );
        }

    }
    else if(direction == 'down'){
        backlightLevel -=1;
        if(backlightLevel > 0){
            timerBacklightOff = setTimeout(function(){exports.backlight(backlightLevel, "down")}, 5* wiz.FadeOut*Math.exp(1/(backlightLevel+1))); // was 10
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
                //console.log('The backlight value is now: ' + value);
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
            if(wiz.PanID) {
                if ((Pan != wiz.PanID) && (wiz.PanID.length > 3)) {//if the pan id is not the one we want then change it // and make sure tha there is a valid panID
                    console.log("changing Pan ID");
                    setTimeout(function () {
                        xbee.xbeeSetPanID(0, 0, wiz.PanID)
                    }, 1600);
                }
            }
        });
        fs.readFile(macAddress, 'utf8', (err,filetxt) => {
            if (err) {
                console.log("MAC ERROR:  " + err);
            }
            else {
                global.Mac = filetxt;
                console.log("Mac Address: " + global.Mac);
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

    cb({changeList:changeList,filesToTransfer:filesToTransfer,filesToDelete:filesToDelete});

    function addToChangelist(reason){
        // this function adds the file to the to-get list
        // and also splits the file up to the right size chuncks
       var counter = 0;
       var chunks = Math.trunc(remote[r].size/maxChunkSize)+1
        if (remote[r].size > maxChunkSize){
            for (var x=0;x<remote[r].size;x=x+maxChunkSize){
                ++counter
                changeList.push({
                    name:r,
                    action:'get',
                    size:remote[r].size,
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
    if (filename == list[fileListCounter].name){
        clearInterval(global.getFileTimeout);
        if (list[fileListCounter].action == 'get'){
            ws.send(JSON.stringify({object:'updateStatus',text:'Got File:'+list[fileListCounter].name+':'+list[fileListCounter].reason}),'updateunit');
        } else {
            ws.send(JSON.stringify({object:'updateStatus',text:'Deleted File:'+list[fileListCounter].name}),'updateunit');
        }


        if (fileListCounter < list.length - 1) {
            ++fileListCounter
            getNextFile();
        } else {
            exports.getShowVersions(function(x){
                ws.send(JSON.stringify({object:'updateStatus',text:'All Files Recieved'}),'updateunit');

                console.log('Old Show Versions:')
                console.log(JSON.stringify(global.settings.showVersion,null,4))
                global.settings.showVersion= x
                console.log('New Show Versions:')
                console.log(JSON.stringify(global.settings.showVersion,null,4))

                console.log('All files recieved');
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
    var showDirectoryCreated= false
    var lastDirectory = ''
    var listCounter = 0;
    var list
    const showPath = 'public/show/' // also in llibR6

    exports.dirToObject(show,function(localFiles){
           if (!localFiles){localFiles={}}; // if its a new show

           var ws = new WebSocket('ws://'+ip)

            ws.on('open', function open() {
                console.log('connected to remote server')
                //ws.send(JSON.stringify({type:'uploadfiles',data:o}));
                ws.send(JSON.stringify({type:'getfiles',data:localFiles,show:show}));

            });

            ws.on('message', function incoming(data) {
                data = JSON.parse(data);
                switch(data.type) {
                    case "remoteFileInfo":
                        var remoteFiles = data.remoteFiles
                        console.log('received file info for show:'+show+' from:'+ip)

                        ll.compareFiles(localFiles,remoteFiles,function(rslt) {
                            list = rslt.changeList;
                            console.log('Files To Transfer:'+rslt.filesToTransfer);
                            console.log('Files To Delete:'+rslt.filesToDelete);
                            listCounter=0;

                      // console.log(JSON.stringify(list,null,4))
                            ws.send(JSON.stringify({type:'getfile',file:list[listCounter]}));

                        })
                        break;
                    case "file":
                        var file = data.file
                      console.log(file.relativePath)
                        if (!showDirectoryCreated){
                            showDirectoryCreated = true;
                            try {
                                fs.mkdirSync(showPath+file.relativePath.substr(0,file.relativePath.indexOf('/')))
                            } catch (err) {
                                if (err.code !== 'EEXIST') {throw err}

                            }
                        }
                        //check the show directory
                        var s0 = file.relativePath.indexOf('/');
                        var s1 = file.relativePath.lastIndexOf('/');
                        if (s0 != s1){ // contains a service path

                            var servicePath = file.relativePath.substr(0,s1+1)
                            if (lastDirectory != servicePath){
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

                            console.log('data length:' + file.data.length)
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
                            console.log('lastModified:'+file.lastModified)
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
            ws.on('error', function (err) {
                    console.log('Error - websocket client:'+err);
                global.updatingUnit = true;
                cb({error:err})

            });
        function filerec(filename){
            if (filename == list[listCounter].name){
                clearInterval(global.getFileTimeout);
                if (list[fileListCounter].action == 'get'){
                    console.log('Got File:'+list[listCounter].name+':'+list[listCounter].reason)
                } else {
                    console.log('Deleted File:'+list[listCounter].name+':'+list[listCounter].reason)
                }


                if (listCounter < list.length - 1) {
                    ++listCounter



                   if (list[fileListCounter].action == 'get'){
                       ws.send(JSON.stringify({type:'getfile',file:list[listCounter]}));
                   } else
                   {
                       fs.unlink(showPath+list[fileListCounter].name,function(e){
                           if (e){
                               console.log('delete error:'+e)
                           } else {
                                console.log('file deleted')
                               filerec(list[fileListCounter].name)
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
            case"showVersion":
                if (!global.updatingUnit){
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
            default:
                console.log('Unknow message type from udpSocket:'+message.type)


        }
    });

    udpSocket.on('listening', () => {
        udpSocket.addMembership('224.1.1.1');
        console.log("UDP Socket Address:"+udpSocket.address().address);

    });

    udpSocket.bind(41235);

}
function getWiz(show,cb){
    try{
        fs.accessSync('./public/show/'+show+'/wiz.dat')
    }catch(e){
        console.log('./public/show/'+show+'/wiz.dat does not exist')
        cb({Version: -1})
        return;
    }

    rv = {};


    const rl = readline.createInterface({
        input: fs.createReadStream('./public/show/'+show+'/wiz.dat')
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

function getShowNames(cb) {
    fs.readdir('public/show', (err, data) => {
        var shownames = [];
        console.log(data)
        data.forEach(function (data) {
            if (fs.lstatSync('public/show/' + data).isDirectory()) {
                //console.log('Show found:' + data)
                shownames.push(data);
            }
        })
        shownames.sort();
        if (cb){cb(shownames)}
    })
}
exports.getShowVersions = function(cb){
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
        })
    }


    })

}