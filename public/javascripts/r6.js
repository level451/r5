var pagename ='r6';
var events = [];
var inttimer = null;
var offset = 0;
var audio
const itemsToDisplay =10;
const volumeTimeout = 3000;
var volTimer = 0;
function load() {

    canvas = document.getElementById('canvas')
    canvas.width=window.outerWidth
    canvas.height=(window.outerWidth*(.5625)); // aspect ratio set to 16/9
    scale = window.outerWidth/320 // //320 is the default indow size - everything will be scaled according to this
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
    // draw the welcome image

    var welcomeImage = new Image();
    welcomeImage.src = 'show/Welcome.jpg'

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
                case 3:
                    var speed = 150;
                    //console.log('show/'+wiz.ShowName+'/'+languageList[menuItem-1]+'/AUDA1.mp3');
                    audio = new Audio('show/'+wiz.ShowName+'/'+languageList[menuItem-1]+'/AUDA0.mp3');
                    audio.play();

                    ctx.fillStyle = "#000000";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    drawMenuText(languageList,menuItem,true);
                    setTimeout(function(){
                        ctx.fillStyle = "#000000";

                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    },speed *1)
                    setTimeout(function(){
                        drawMenuText(languageList,menuItem,true);
                    },speed *2)
                    setTimeout(function(){
                        ctx.fillStyle = "#000000";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    },speed *3)
                    setTimeout(function(){
                        drawMenuText(languageList,menuItem,true);
                    },speed *4)
                    setTimeout(function(){
                        ctx.fillStyle = "#000000";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    },speed *5)
                    // setTimeout(function(){
                    //     drawMenuText(languageList,menuItem,true);
                    // },speed *6)
                    // setTimeout(function(){
                    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
                    // },speed *7)
                    break;
            }
            break;
        case 'adjustingvolume':
        case 'playaudio':
            sysState = 'adjustingvolume'
            switch(s){
                case 1:
                    wiz.Volume = (wiz.Volume*1) + 10
                    break;
                case 2:
                    wiz.Volume = (wiz.Volume*1) - 10
                    break;
            }

            if (typeof(audio) == 'object'){
                audio.volume = wiz.Volume/100;
            }
            drawVolume();
            console.log('Volume:'+wiz.Volume)
            break;

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


function drawMenuText(list,item,itemonly){
    ctx.fillStyle = "#000000";

    ctx.fillRect(0, 0, canvas.width, canvas.height);

var counter = 1;
 //   ctx.font = (200/itemsToDisplay)*scale+'px sans-serif'
    ctx.font = (200/itemsToDisplay)*scale+'px Verdana'
//for (var i = item-(Math.floor(itemsToDisplay/2));i<(itemsToDisplay-(Math.floor(itemsToDisplay/2))+1);++i)
    for (var i = item-(Math.floor(itemsToDisplay/2))-1;i<list.length;++i)

{
    if((list[i] != undefined && !itemonly)|| (itemonly && i==item-1)){

        if (i==item-1){
            ctx.fillStyle = "#ff0000";
        } else
        {
            ctx.fillStyle = "#FFFFFF";
        }
        ctx.fillText(list[i],(canvas.width/2)-(ctx.measureText(list[i]).width/2),(counter*(canvas.height/(itemsToDisplay+1)))+20*scale);

    }
    // if (i==item-1){
    //     console.log('== '+languageList[i-1])
    //     ctx.rect(0,((counter*(canvas.height/(itemsToDisplay+1)))+20*scale)+27,canvas.width,-134);
    //     ctx.stroke();
    //
    //
    // }

  //  console.log(list[i])
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
                    case "simbutton":
                        switchPress(x.data);
                        break;
                    case "cue":
                        console.log('cue - data:'+x.data)
                        switch (x.type)
                        {
                            case 'slide':
                               displaySlide(x.data);
                                break;
                            case 'audio':
                                playAudio(x.data);
                                break;

                            default:
                               console.log('Unhandled extension:'+x.type)
                                break;


                        }
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
function displaySlide(d){
    console.log ('display slide:'+d)
    sysState = 'displayslide'; // set mode to show
    ctx.fillStyle="black";
    ctx.globalAlpha = 1

    ctx.fillRect(0, 0, canvas.width, canvas.height); // clear the screen
    img = new Image();
    console.log('image:'+'show/'+wiz.ShowName+'/'+languageList[menuItem-1]+'/'+d)
    img.onload =function(){
      console.log('onload')
        //ctx.drawImage(img, 0, 0, img.width, img.height);



        ctx.globalAlpha = 0
        fadeTime = 30000
        startTime = false
        fadeIn();
    }
    img.src = '/show/'+wiz.ShowName+'/'+languageList[menuItem-1]+'/'+d;
}

function fadeIn(t){
    if (fadeTime == 0 ){
        return
    }

    if (!startTime) {
        startTime = t
    console.log('starttime'+startTime)
    }
    ctx.globalAlpha = (t-startTime) /fadeTime
    drawImage();
    if (!startTime || t-startTime < fadeTime ){
        requestAnimationFrame(fadeIn)
    } else{
        console.log (t-startTime)
    }

}

function playAudio(d){
    sysState = 'playaudio'; // set mode to audio -
    if (typeof(audio) == 'object'){
        audio.pause();
    }

    audio = new Audio('show/'+wiz.ShowName+'/'+languageList[menuItem-1]+'/'+d);
    //if (typeof(audio) == 'object'){
        audio.volume = wiz.Volume/100;
    //}
    audio.onended=function(){
        console.log('playback ended')
        sysState = 'show'; // set mode to show
    }
    audio.onerror=function(){
        console.log('playback error')
        sysState = 'show'; // set mode to show
    }

    audio.play();



}
function drawImage(){
    x2 = img.width*(canvas.height/img.height)
    x1 = (canvas.width-x2)/2
    ctx.drawImage(img, x1, 0, x2, canvas.height);


}
function drawVolume() {
    fadeTime = 0; // stop the fading
    ctx.globalAlpha = 1
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height); // clear the screen
    if (typeof(img) == "object") {
        drawImage()
    }
    ctx.font = (200 / itemsToDisplay) * scale + 'px Verdana'
    ctx.fillStyle = "#00FF00";

    var displayText = "Volume:" + wiz.Volume
    ctx.fillText(displayText, (canvas.width / 2) - (ctx.measureText(displayText).width / 2), canvas.height * .80);

    clearTimeout(volTimer)
    volTimer = setTimeout(function(){
        ctx.globalAlpha = 1
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height); // clear the screen
        if (typeof(img) == "object") {
            drawImage()
        }

        console.log('volume timeout')
    },volumeTimeout)
}


