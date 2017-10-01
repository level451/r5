/**
 * Created by todd on 8/24/2017.
 */
const reconnectInterval = 5000
exports.start = function(){
    connect('witzel.asuscomm.com:4691')
}
var phws
function connect(ip) {
    var retryTimeout;
    const WebSocket = require('ws')
    phws = new WebSocket('ws://' + ip)

    phws.on('open', function open() {
        sendUnitInfo()

        // 2nd - connect to the remote unit and get its file list
//            phws.send(JSON.stringify({type:'getfiles',data:localFiles,show:show}));

    });

    phws.on('message', function incoming(data) {

        var d = JSON.parse(data);
        switch (d.type) {
            case "command":
                commandProcessor(d.command)
                break;
            default:
                console.log('unknown type:' + data.type)

        }

    });
    phws.on('close', function () {

//        console.log('websocket closed')

        retry()
    })
    phws.on('error', function (err) {
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
    requestUnitInfo:"Refresh!",
    exit:"Exit",
    keyLeft:"Left/Down",
    keyRight:"Right/Up",
    keyEnter:"Enter",
    keyAdminMenu:'Admin Menu',
    captureCanvas:'View Screen'
}
if (require('os').type() != "Windows_NT"){
    unitCommands = Object.assign(unitCommands , {
        stopBrowser:'Stop Browser',
        startBrowser:'Start Browser'

    })
}
function commandProcessor(c){
    switch (c.command) {
        case "updateFirmware":
            updateFirmware();
            break;

        case "exit":
            //process.exitCode = 100;
            ll.usbDisconnect(0);
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
            ll.usbDisconnect(100);
            break;
        case "keyEnter":
            ws.send(JSON.stringify({object:'simbutton',data:3}),'r6')
            break;
        case "keyLeft":
            ws.send(JSON.stringify({object:'simbutton',data:2}),'r6')
            break;
        case "keyRight":
            ws.send(JSON.stringify({object:'simbutton',data:1}),'r6')
            break;
        case "keyAdminMenu":
            ws.send(JSON.stringify({object:'simbutton',data:6}),'r6')
            break;
        case "captureCanvas":
            ws.send(JSON.stringify({object:'captureCanvas'}),'r6')
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
            ll.usbDisconnect(100);

        }
        console.log(resp)

    });

}
function sendUnitInfo(){

    phws.send(JSON.stringify(
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
exports.sendCanvasImage = function(data){
    console.log('ph captured image')
    phws.send(JSON.stringify({type:'canvasImage',data:data.data, mac:global.Mac }))

}
exports.sendtoPH = function(d){
    d.mac = global.Mac
    phws.send(JSON.stringify(d))

}
exports.sendUnitInfo = function(){
    sendUnitInfo()
}