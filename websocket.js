var debug =  true
console.log = {}
console.log = (function () {return function (x) {if (debug) {process.stdout.write(ll.ansitime('blue','websocket ') + x + '\n');}}})();/**

 * Created by todd on 1/22/14.
 */
websocket = {};
var request = require('request');
var os = require('os');
var llibR6 = require('./llibR6');

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
            var fs=require('fs');
            fs.writeFileSync('./public/show/show.def',data.data.ShowName)


            ll.loadWiz(function(){
                console.log('New show selected:'+settings.ShowName)
                ws.send(JSON.stringify({object:'reload'}),'r6'); // send the reload to all the 'r6' webpages

            })
            break;
        case "requestunitstatus":
             //return;
            ll.getUnitSettings();
            break;
        case "fadeIn":
            ll.backlightOn();
            break;
        case "fadeOut":
            ll.backlightOff();
            break;

       default:
            console.log('unknown datatype '+data.type)

    }

}
