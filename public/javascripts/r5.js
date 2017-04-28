var pagename ='r5';
var events = [];
var inttimer = null;
var offset = 0;



function load() {

    canvas = document.getElementById('canvas')
    canvas.width=window.outerWidth
    canvas.height=(window.outerWidth*(3/4)); // aspect ratio set to 16/9
    scale = window.outerWidth/320 // //320 is the default indow size - everything will be scaled according to this
    // draw the welcome image
    ctx = canvas.getContext('2d');
    document.addEventListener('keydown', function(evt) {
        switch (evt.key){
            case 'a':
                switchPress(1);
                break;
            case 'z':
                switchPress(2);
                break;
            case ' ':
                switchPress(3);
                break;


        }


    }, false);
    var welcomeImage = new Image();

    welcomeImage.onload = function(){
   //     ctx.drawImage(welcomeImage,0,0,canvas.width,canvas.height)
        languageList = getLanguages();
        var t0 = performance.now();
        menuItem = 1;
        drawMenuText(languageList,menuItem);
        sysState = 'languageMenu'




        //  int = setInterval(function(){
        //     offset+=1;
        //      var t0 = performance.now();
        //      drawMenu(offset);
        //      var t1 = performance.now();
        //     // console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.")
        //
        //     if (offset > 100){clearInterval(int)}
        // },20)
    }
    //welcomeImage.src = 'show/'+wiz.ShowName+'/Welcome.jpg'
    welcomeImage.src = 'show/Welcome.jpg'
    websockstart();


}
function switchPress(s){
    console.log(s)

    switch (sysState){
        case 'languageMenu':
            switch(s){
                case 1:
                    --menuItem
                    if (menuItem<1){
                        menuItem=1;
                    }
                    console.log('menuitem:'+menuItem)
                    drawMenuText(languageList,menuItem);

                    break;
                case 2:
                    ++menuItem
                    if (menuItem>languageList.length){
                        menuItem=languageList.length;
                    }
                    console.log('menuitem:'+menuItem)
                    drawMenuText(languageList,menuItem);

                    break;
            }


    }
}
function getLanguages(){
    var rv = []
    for (var key in wiz) {
        if (key.indexOf('Service') == 0  ){
            rv.push(wiz[key])
        }
    }
    return rv
}
function drawMenu(offset){
    ctx.putImageData(menu,0,offset)
}


function drawMenuText(list,item){
      ctx.clearRect(0, 0, canvas.width, canvas.height);

const itemsToDisplay = 5;
var counter = 1;
    ctx.font = (200/itemsToDisplay)*scale+'px sans-serif'

//for (var i = item-(Math.floor(itemsToDisplay/2));i<(itemsToDisplay-(Math.floor(itemsToDisplay/2))+1);++i)
    for (var i = item-(Math.floor(itemsToDisplay/2))-1;i<list.length;++i)

{
    if(list[i] != undefined){
        ctx.fillText(list[i],(canvas.width/2)-(ctx.measureText(list[i]).width/2),(counter*(canvas.height/(itemsToDisplay+1)))+20*scale);
        console.log((canvas.width/2)-(ctx.measureText(list[i]).width/2))
    }
    if (i==item-1){
        console.log('== '+languageList[i-1])
        ctx.rect(0,((counter*(canvas.height/(itemsToDisplay+1)))+20*scale)+27,canvas.width,-134);
        ctx.stroke();
console.log('x1:'+ctx.measureText(list[i]).height)

    }

    console.log(list[i])
    ++counter
}
//menu = ctx.getImageData(0,0,canvas.width,list.length*(canvas.height/(itemsToDisplay+1)));

}
function getFont(fontSize) {
    return (document.getElementById('canvas').width *fontSize / 240) + 'px sans-serif';
}

function websockstart(){
    ws = new ReconnectingWebSocket(wsUri);
    ws.onopen = function(evt){
        console.log("websocket connected");
        websocketsend('setwebpage',{pagename:pagename});
        if (typeof(fully) == 'object') {
            // running from fully kiosk browse

            websocketsend('fully',{
                StartUrl:fully.getStartUrl(),
                Ip4Address:fully.getIp4Address(),
                MacAddress:fully.getMacAddress(),
                WifiSsid:fully.getWifiSsid(),
                SerailNumber:fully.getSerialNumber(),
                DeviceId:fully.getDeviceId(),
                BatteryLevel:fully.getBatteryLevel(),
                ScreenBrightness:fully.getScreenBrightness(),
                ScreenOn:fully.getScreenOn(),
                //  InForeground:fully.isInForeground(),
                Plugged:fully.isPlugged(),
                //MotionDetectionRunning:fully.isMotionDetectionRunning()

            });

        }


    };
    ws.onmessage = function(evt) {
        switch (typeof(evt.data)){
            case 'string':
                var x = JSON.parse(evt.data);
                switch(x.object){
                    case "things":
                        break;

                    case  "pageupdate":
                        document.getElementById("body").innerHTML = x.data.html
                        console.log('HTML BODY UPDATE')
                        break;
                    case "fully":
                        if (x.parms){

                            fully[x.cmd](x.parms);
                        }else
                        {
                            fully[x.cmd]();

                        }
                    default:
                        console.log(x.object);
                    //  alert(x.object);
                }
                break;
            case 'object':
                console.log(JSON.stringify(evt,null,4))
        }


    };

}
function websocketsend(type,data){

    var sendobj = {};
    sendobj.type = type;
    sendobj.data = data;
    ws.send(JSON.stringify(sendobj));

}