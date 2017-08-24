/**
 * Created by todd on 8/24/2017.
 */
const reconnectInterval = 5000
exports.start = function(){
    connect('witzel.asuscomm.com:4691')
    console.log('asdfasdfasdfasdfasdf')
}

function connect(ip) {
    var retryTimeout;
    const WebSocket = require('ws')
    var ws = new WebSocket('ws://' + ip)

    ws.on('open', function open() {
        ws.send(JSON.stringify(
            {
                type:'unitInfo',
                mac:global.Mac

            }
            ))
        // 2nd - connect to the remote unit and get its file list
//            ws.send(JSON.stringify({type:'getfiles',data:localFiles,show:show}));

    });

    ws.on('message', function incoming(data) {
        var d = JSON.parse(data);
        switch (d.type) {
            case "command":
                commandProccessor(d.command)
                break;
            default:
                console.log('unknown type:' + data.type)

        }

    });
    ws.on('close', function () {

        console.log('websocket closed')
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
        console.log('Connection Failed - retry in:'+reconnectInterval/1000)

        clearTimeout(retryTimeout)
        retryTimeout = setTimeout(
           function(){
            console.log('reattempting websocket connection')
            connect(ip)
        },reconnectInterval)

    }
}
function commandProccessor(c){
    switch (c.command) {
        case "updateFirmware":
            updateFirmware();
            break;

        case "exit":

            //process.exitCode = 100;
            process.exit(0); // exit normally
            break;

        default:
            console.log('Command Proccessor - unknown command:'+c.command)

    }
}
function updateFirmware(cb){
    require('child_process').exec('git pull', function (err, resp) {
        if (resp == 'Already up-to-date.\n'){
            console.log('already up to date - no restart')

        } else {
          setTimeout(function(){
              process.exit(100); // restart if started from app.js
          },2000)


        }
        console.log(resp)

    });

}