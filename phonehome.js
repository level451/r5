/**
 * Created by todd on 8/24/2017.
 */
const reconnectInterval = 5000
console.log('asdfasdf')
exports.start = function(){
    connect('witzel.asuscomm.com:4691')
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
        data = JSON.parse(data);
        switch (data.type) {
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