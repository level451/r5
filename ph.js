/**
 * Created by todd on 8/24/2017.
 */
const reconnectInterval = 5000
exports.start = function(){
    connect('witzel.asuscomm.com:4691')
}
var ws
function connect(ip) {
    var retryTimeout;
    const WebSocket = require('ws')
    ws = new WebSocket('ws://' + ip)

    ws.on('open', function open() {
        sendUnitInfo()

        // 2nd - connect to the remote unit and get its file list
//            ws.send(JSON.stringify({type:'getfiles',data:localFiles,show:show}));

    });

    ws.on('message', function incoming(data) {
        console.log('onmessage')
        var d = JSON.parse(data);
        switch (d.type) {
            case "command":
                commandProcessor(d.command)
                break;
            default:
                console.log('unknown type:' + data.type)

        }

    });
    ws.on('close', function () {

//        console.log('websocket closed')

        retry()
    })
    ws.on('error', function (err) {
        if (err.code == 'ECONNREFUSED' || err.code =='ETIMEDOUT'){
            retry()
        } else
        {
            console.log('Error - PH websocket client:' + JSON.stringify(err));
        }




    });
    function retry(){
       // console.log('Connection Failed - retry in:'+reconnectInterval/1000)

        clearTimeout(retryTimeout)
        retryTimeout = setTimeout(
           function(){
            connect(ip)
        },reconnectInterval)

    }
}
var unitCommands = {
    updateFirmware:"Update!",
    restart:"Restart!",
    requestUnitInfo:"Refresh!"
}
if (require('os').type() != "Windows_NT"){
    unitCommands + unitCommands + {
        stopBrowser:'Stop Browser',
        startBrowser:'Start Browser'

    }
}
function commandProcessor(c){
    switch (c.command) {
        case "updateFirmware":
            updateFirmware();
            break;

        case "exit":
            //process.exitCode = 100;
            ll.usbDisconnect();
            setTimeout(function(){
                process.exit(0); // restart if started from app.js
            },1000)
            break;
        case "stopBrowser":
           ll.stopBrowser()
            break;
        case "startBrowser":
            ll.startBrowser()
            break;
        case "requestUnitInfo":
            sendUnitInfo()
            break;
        case "restart":
            //process.exitCode = 100;
            ll.stopBrowser()
            ll.usbDisconnect(true);



            break;


        default:
            console.log('PH Command Processor - unknown command:'+c.command)

    }
}
function updateFirmware(cb){
    require('child_process').exec('git pull', function (err, resp) {
        if (resp == 'Already up-to-date.\n'){
        } else {
            console.log(resp)
            ll.stopBrowser()
            ll.usbDisconnect(true);

        }
        console.log(resp)

    });

}
function sendUnitInfo(){

    ws.send(JSON.stringify(
        {
            type:'unitInfo',
            mac:global.Mac,
            ip: global.myuri,
            settings:global.settings,
            pjson:require('./package.json'),
            status:{Battery: global.Battery,
                Pan: global.Pan,
                Signal: global.Sig,
                Temperature: global.Temperature,
                uptime:((new Date()-global.settings.performance.startTime)/60000)+' Minutes'

            },
            commands:unitCommands
        }
    ),(err)=>{
        if (!err){
            process.stdout.write(':)')
        } else
        {
            console.log('PH - socket send error:'+err)
        }


    })

}