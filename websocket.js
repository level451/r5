var debug =  true
console.log = {}
console.log = (function () {return function (x) {if (debug) {process.stdout.write(ll.ansitime('blue','websocket ') + x + '\n');}}})();/**

 * Created by todd on 1/22/14.
 */
websocket = {};
var request = require('request');
var llibR6 = require('./llibR6');
var showDirectoryCreated= false
var lastDirectory = ''
var updateUnitIntervalTimer
//const showPath = 'temp/'
const showPath = 'public/show/' // also in llibR6
//Set up Web socket for a connection
//exports.start = function(wscallback,port){
var WebSocketServer = require('ws').Server;

//Set up the web socket here..
wss = new WebSocketServer({port: settings.webSocket.listenPort}, function(err,res){
    //  console.log(wss.url);
    if (err){
        console.log("Websocket error:"+err);
    }
    else
    {
        console.log("Websocket Server Listening on Port:"+settings.webSocket.listenPort);
        if(os.type() != 'Windows_NT') { //if now windows, then open web browser and point it to us
             setTimeout(startBrowser,1000);
             setTimeout(function(){llibR6.backlight(100)},1100);
        }
    }
});

function startBrowser(){
    const execSeries = require('exec-series');

    execSeries(['DISPLAY=:0 sudo  -u fa unclutter &'], (err, stdouts, stderrs) => {//
        if (err) {
            console.log(err);
            throw err;
        }

        console.log(stdouts); // yields: ['foo\n', 'bar\n']
        console.log(stderrs); // yields: ['', '']
    });
    console.log("unclutter started");

    execSeries(['DISPLAY=:0 sudo -u fa chromium-browser --incognito  --kiosk http://localhost:3111/ '], (err, stdouts, stderrs) => {//finally starts up withD DOSPLAY:0  -- WHO KNOWS WHY?
        if (err) {
            console.log(err);
            throw err;
        }

        console.log(stdouts); // yields: ['foo\n', 'bar\n']
        console.log(stderrs); // yields: ['', '']
    });
    console.log("browser started");
}

wss.on('connection', function(ws) {
    var i = 0;
    while (true)
    {
        if (!websocket[i]){
            break;
        }
        i++;
    }
    websocket[i]=ws;
    /************************************************/
    if (settings.webSocket.showConnectioninfo){
        if (websocket[i]._socket.remoteAddress.substr(0,3) != '10.'
            && websocket[i]._socket.remoteAddress.substr(0,7) != '192.168'
            && websocket[i]._socket.remoteAddress.substr(0,7) != '127.0.0'
        )
        {
            // get info on id address
            request.get({
                url: 'http://ipinfo.io/'+websocket[i]._socket.remoteAddress,
            },function(err,rslt){
                console.log('Websocket Connected Id:'+i+" websocket ip Remoteaddress info:"
                    +ll.ansi('brightRed',JSON.parse(rslt.body).hostname+':'+ websocket[i]._socket.remoteAddress));
            });
        }else
        {
            console.log('Websocket Connected Id:'+i+" LocalAddress:"+websocket[i]._socket.remoteAddress);
        }
    }
    /************************************************/
    var thisId= i;
    ws.on('message', function(message) {
        //  console.log("message :"+message)
        var data = JSON.parse(message);
        if (!data){
            console.log('no data in websocket message from'+thisId);
            return;
        }
        wsData(data,thisId);

//            level451.wsDataIn(message,thisId);

        //  console.log('received: %s', message,thisId);
    });
    ws.on('close', function(ws){
        console.log('Websocket disconnected Id:'+thisId +'('+websocket[thisId].pagename +')');
        delete websocket[thisId];
    });
    ws.on('error', function(ws){
        console.log('Websocket Error Id:'+thisId);
        delete websocket[thisId];
    });
});
exports.webpageConnected = function(pagename){

    for (var i = 0; i < settings.webSocket.maxConnections; i++) {
        if (websocket[i] && websocket[i].pagename == pagename) {
            return true
        }
    }
    return false
}

exports.send = function(data,id,binary)
{
    // id passed as a webpage name - only send it to those webpages
    if (id && id.length > 2) {
        //   console.log('send to NAME:'+id)
        for (var i = 0; i < settings.webSocket.maxConnections; i++) {
            if (websocket[i] && websocket[i].pagename == id) {
                websocket[i].send(data);
            }
        }
    }else
    {
        if (id && id > -1 && websocket[id])
        // an id was passed - just send it to that websocket
        {
            //console.log('send to ONE:'+id)
            websocket[id].send(data,binary);
        } else
        {
            //  console.log('send to ALL:'+id)

            // no id passed - send it to all connected websockets
            //someday fix this so it tracks the number of connections
            for (var i=0; i < settings.webSocket.maxConnections; i++)
            {
                if (websocket[i])
                {
                    websocket[i].send(data,binary);
                    //console.info("websocket sending to client "+i);
                }
            }
        }
    }
};
/**
 * Created by todd on 3/14/2016.
 */
function wsData(data,id){
    const fs = require('fs');
    switch(data.type) {
        case "simbutton":
            ws.send(JSON.stringify({object:'simbutton',data:data.data}),'r6'); // send the simulate4d button press data to all the 'r6' webpages
            console.log('simulted button:'+data.data)
            break;
        case "setwebpage":
            websocket[id].pagename = data.data.pagename;
            //console.log(util.inspect(websock));
            console.log(websocket[id].pagename+':'+id )
            break;
        case "cue":
            cp.incommingCue(data.data)
            break;
        case "selectshow":
            ll.wifiandPanIdcheckandset();// puts pan id and wifi in correct mode for the show
            fs.writeFileSync('./public/show/show.def',data.data.ShowName) // switch to the new show


            ll.loadWiz(function(){
                console.log('New show selected:'+settings.ShowName)
                ws.send(JSON.stringify({object:'reload'}),'r6'); // send the reload to all the 'r6' webpages

            })
            break;
        case "requestunitstatus":
             //return;
            ll.getUnitSettings();
            break;
        case "backlightOn":

            if (data.data.backlight){
                console.log('backlight ON called:'+JSON.stringify(data.data.backlight))
                wiz.Backlight = data.data.backlight;
                console.log('backlight set to:'+wiz.Backlight)

            }
            ll.backlightOn(wiz.Backlight);
            break;

        case "fadeIn":
            ll.backlightOn();
            break;
        case "fadeOut":
            ll.backlightOff();
            break;
        case "testModeOff":
            global.testMode = false;
            break;
        case "testModeOn":
            global.testMode = true;
            break;
        case "demoModeOn":
            global.demoMode = true;
            console.log('Demo Mode ON')
            break;
        case "demoModeOff":
            global.demoMode = false;
            console.log('Demo Mode OFF')
            break;
        case "demoCue":
            if (global.demoMode){
                console.log('Demo Mode Cue received:'+data.data.cue)
                console.log(wiz.ShowName);
                console.log(wiz.Directory)
                var path = './public/show/'+wiz.ShowName+'/'+wiz.Directory+'/'
                fs.access(path+'slide'+data.data.cue+'.mp4', (err) => {
                    if (!err){
                        console.log('found slide'+data.data.cue)
                        cp.incommingCue(wiz.ShowName+' GO slide'+data.data.cue+'.mp4')
                    } else

                    {
                        // no mp4 now check for jpgs and audio
                        fs.access(path+'slide'+data.data.cue+'.jpg', (err) => {
                            if (!err){
                                console.log('found slide'+data.data.cue)
                                cp.incommingCue(wiz.ShowName+' GO slide'+data.data.cue+'.jpg')
                            }
                        })
                    }
                })
            }
            break;
        case "setDirectory":
            wiz.Directory = data.data.directory;
            break;
        case "file": //write the file received

            var file = data.data;
            // verifiy the show is directory exists
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
            //console.log(file.split+':'+file.first)
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
                        ll.gotFile(file.relativePath)
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
                        ll.gotFile(file.relativePath)

                    }

                })


            }


        function updateUtimes(){
                fs.utimes(showPath+file.relativePath,file.lastModified/1000,file.lastModified/1000,function(err){
                    if (err){console.log('error:'+err);}

            //        process.stdout.write(((file.split)?'*':'.'))
                    ll.gotFile(file.relativePath)
                })


            }
            break;

        case "comparefiles":
            var remoteFiles = data.data;
            console.log('Comparing Remote and Local Files for:'+remoteFiles.show);
            ws.send(JSON.stringify({object:'updateStatus',text:'Reading remote file info'}),'updateunit');

            ll.dirToObject(remoteFiles.show,function(localFiles){
                if (!localFiles){ // new show
                    localFiles={};
                    delete remoteFiles.show;
                    delete remoteFiles.version;

                    ws.send(JSON.stringify({object:'updateStatus',text:'No version found - upload required'}),'updateunit');
                    ll.compareFiles(localFiles,remoteFiles,function(rslt){
                        ws.send(JSON.stringify({object:'updateStatus',text:'Files to delete:'+rslt.filesToDelete}),'updateunit');
                        ws.send(JSON.stringify({object:'updateStatus',text:'Files to transfer:'+rslt.filesToTransfer}),'updateunit');
                        ws.send(JSON.stringify({object:'updateStatus',text:'Total Mbytes to transfer:'+(rslt.bytesToTransfer/1048576).toFixed(2)}),'updateunit');
                        ws.send(JSON.stringify({object:'okToUpload',bytesToTransfer:rslt.bytesToTransfer,filesToTransfer:rslt.filesToTransfer}),'updateunit');
                        ws.send(JSON.stringify({object:'updateStatus',text:'Press UPLOAD to start'}),'updateunit');
                    })
                    return;
                }
                ws.send(JSON.stringify({object:'updateStatus',text:'Remote Version '+localFiles.show+' Version:'+localFiles.version}),'updateunit');
                if (localFiles.version == remoteFiles.version){
                    ws.send(JSON.stringify({object:'updateStatus',text:'Same version found - checking files'}),'updateunit');
                    ll.compareFiles(localFiles,remoteFiles,function(rslt){
                     //   console.log(JSON.stringify(rslt.changeList,null,4))
                        ws.send(JSON.stringify({object:'updateStatus',text:'Files to delete:'+rslt.filesToDelete}),'updateunit');
                        ws.send(JSON.stringify({object:'updateStatus',text:'Files to transfer:'+rslt.filesToTransfer}),'updateunit');
                        ws.send(JSON.stringify({object:'updateStatus',text:'Total Mbytes to transfer:'+(rslt.bytesToTransfer/1048576).toFixed(2)}),'updateunit');
                        if (rslt.filesToDelete== 0 && rslt.filesToTransfer == 0) {
                            ws.send(JSON.stringify({object:'showUpToDate'}),'updateunit');
                            return;

                        } else {
                            ws.send(JSON.stringify({object:'okToUpload',bytesToTransfer:rslt.bytesToTransfer,filesToTransfer:rslt.filesToTransfer}),'updateunit');

                        }

                    })
                    return
                } else
                {
                    ws.send(JSON.stringify({object:'updateStatus',text:'Update required to Version:'+remoteFiles.version}),'updateunit');
                    ll.compareFiles(localFiles,remoteFiles,function(rslt){
                     //   console.log(JSON.stringify(rslt.changeList,null,4))
                        ws.send(JSON.stringify({object:'updateStatus',text:'Files to delete:'+rslt.filesToDelete}),'updateunit');
                        ws.send(JSON.stringify({object:'updateStatus',text:'Files to transfer:'+rslt.filesToTransfer}),'updateunit');
                        ws.send(JSON.stringify({object:'updateStatus',text:'Total Mbytes to transfer:'+(rslt.bytesToTransfer/1048576).toFixed(2)}),'updateunit');
                        ws.send(JSON.stringify({object:'okToUpload',bytesToTransfer:rslt.bytesToTransfer,filesToTransfer:rslt.filesToTransfer}),'updateunit');
                        ws.send(JSON.stringify({object:'updateStatus',text:'Press UPLOAD to start'}),'updateunit');
                    })

                }

            })
        break;
        case "uploadfiles":
            showDirectoryCreated = false;
            lastDirectory = '';

            var remoteFiles = data.data;
            console.log('Uploading files for:'+remoteFiles.show);
            ll.dirToObject(remoteFiles.show,function(localFiles){
                if (!localFiles) {
                    localFiles = {};
                    delete remoteFiles.show;
                    delete remoteFiles.version;

                }
                    ll.compareFiles(localFiles,remoteFiles,function(rslt){
                        ws.send(JSON.stringify({object:'updateStatus',text:'Files to transfer:'+rslt.filesToTransfer}),'updateunit');
                        ll.getFilesFromList(rslt.changeList);
                    })



            })
        case "getfiles":
            // browser to unit transfer - gets file from browser
            ll.dirToObject(data.show,function(localFiles){
                ws.send(JSON.stringify({type:'remoteFileInfo',remoteFiles:localFiles}),id);
            });
            break;
        case "getfile":
            // unit to unit transfer
          var file = data.file;

//            console.log(JSON.stringify(data),null,4)
            console.log('public/show/'+file.name)
            var stat = fs.statSync('public/show/'+file.name);
            if (!stat.mtimeMs){stat.mtimeMs = Date.parse(stat.mtime)}




            if (!file.split) {

                ws.send(JSON.stringify({type:'file',
                    file:{
                    relativePath:file.name,
                    data:new Buffer(fs.readFileSync('public/show/'+file.name)).toString('base64'),
                    lastModified:Math.trunc(stat.mtimeMs)
                    }}),id)
            }
             else {


                buffer = new Buffer(file.length),

                    fs.open('public/show/' + file.name, 'r', function (err, fd) {
                        if (err) throw err;

                        fs.read(fd, buffer, 0, file.length, file.start, function (err, nread) {
                            if (err) throw err;

                            var temp = {
                                relativePath:file.name,
                                data: ((nread < file.length)?buffer.slice(0, nread):buffer).toString('base64'),
                                split:true,
                                last:file.last,
                                first:file.first,
                                lastModified:Math.trunc(stat.mtimeMs)
                            }
                            console.log('data length:'+temp.data.length)

                            ws.send(JSON.stringify({type:'file',
                                file:temp}),id)
                            fs.close(fd, function (err) {
                                if (err) throw err;
                            });

                        });

                    });
            }

            // add the file info to the transfrer status

            data.status.file = file.name;
            // send the status to the web page
            ws.send(JSON.stringify({object:'transferStatus',status:data.status}),'updateunit')
            break;
        case "transferComplete":
            ws.send(JSON.stringify({object:'transferStatus',status:data.status}),'updateunit')
            break;

        case "updateUnitModeOn":
            global.updateUnit = true;
            const dgram = require('dgram');
            updateUnitIntervalTimer = setInterval(function(){
                const socket = dgram.createSocket({type:'udp4',reuseAddr:true});
                var beacon = {type:'showVersion',showVersion: global.settings.showVersion}
                socket.send(JSON.stringify(beacon),41235,'224.1.1.1',(err) =>{
                    socket.close();
                });
            },5000)

            break;

        case "updateUnitModeOff":
            clearInterval(updateUnitIntervalTimer);
            global.updateUnit = false;
            break;
        case "requestStatusBeacon":
            // webpage requested status of all units - brodast in
            var socket = require('dgram').createSocket({type:'udp4',reuseAddr:true});
            socket.send(JSON.stringify({type:'requestStatusBeacon'}),41235,'224.1.1.1',(err) =>{
                socket.close();
            });

            break;


        default:
            console.log('unknown datatype '+data.type)

    }

}
exports.updateStatus = function(text){

    ws.send(JSON.stringify({object:'updateStatus',text:text}),'updateunit');

}