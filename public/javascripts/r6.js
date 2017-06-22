var pagename ='r6';
var events = [];
var inttimer = null;
var offset = 0;
var audio;
const itemsToDisplay =10;
const volumeTimeout = 3000;
var volTimer = 0;
var fadeOutTimer = -1;
const systemMenu = ['Select Language','Select Show','Unit Status','option2','option3','Exit'];

function load() {
    disp = document.getElementById('display');
    angle = parseInt(settings.webPage.rotation) ;

    disp.style.position = "absolute";
    if(settings.webPage.rotation== -90 || settings.webPage.rotation == 90) {
        disp.style.top = (settings.webPage.width - settings.webPage.height) / 2 + "px";
        disp.style.left = -1 * ((settings.webPage.width - settings.webPage.height) / 2) + "px";
    }
    else{
        disp.style.top = 0 + "px";
        disp.style.left = 0 + "px";
    }
    disp.style.width = settings.webPage.width + "px";
    disp.style.height = settings.webPage.height +"px";

    disp.style.transform = "rotate(" + settings.webPage.rotation + "deg)";

    canvas = document.getElementById('canvas');
    video = document.getElementById('video');
    display = document.getElementById('display');
    ctx = canvas.getContext('2d');


    canvas.width=settings.webPage.width;
    canvas.height=settings.webPage.height;
    //    canvas.width=window.outerWidth
//   canvas.height=(window.outerWidth*(.5625)); // aspect ratio set to 16/9
    scale = settings.webPage.width/320 ;// //320 is the default indow size - everything will be scaled according to this


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
            case 'q':
                switchPress(6);
                break;
        }


    }, false);
    // draw the welcome image

    var welcomeImage = new Image();
    welcomeImage.src = 'show/'+wiz.ShowName+'/Welcome.jpg';

    welcomeImage.onerror = function(){
        console.log ('welcome image failure:'+'show/'+wiz.ShowName+'/Welcome.jpg')


    };
    welcomeImage.onload = function(){
   //     ctx.drawImage(welcomeImage,0,0,canvas.width,canvas.height)
        if (wiz.Directory && wiz.Directory != ''){
            console.log('here');

            sysState = 'idle';
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

        } else
        {
            languageList = getLanguages();
            menuItem = 1;
            drawMenuText(languageList,menuItem);
            sysState = 'languageMenu'


        }




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
    console.log(s);
    var speed;
    switch (sysState){
        case 'idle':
        //case 'languageMenu':

            if (s == 6){
                // special menu code - go to system menu
                menuItem = 1;
                sysState = 'systemMenu';
                ctx.globalAlpha = 1;

                drawMenuText(systemMenu,menuItem);


            }
            break;
        case 'Unit Status':
            // any switch press in unit status will exit to idle
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            sysState='idle';
            break;
        case 'selectShowMenu':
            switch(s){
                case 1:
                    --menuItem;
                    if (menuItem<1){
                        menuItem=1;
                    }

                    drawMenuText(wiz.allShowsAvailable,menuItem);

                    break;
                case 2:
                    ++menuItem;
                    if (menuItem>wiz.allShowsAvailable.length){
                        menuItem=wiz.allShowsAvailable.length;
                    }
                    console.log('menuitem:'+menuItem);
                    drawMenuText(wiz.allShowsAvailable,menuItem);

                    break;
                case 3:
                    // show selected
                    sysState = 'idle';
                    speed = 150;
                    //console.log('show/'+wiz.ShowName+'/'+languageList[menuItem-1]+'/AUDA1.mp3');
                    ctx.fillStyle = "#000000";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    drawMenuText(wiz.allShowsAvailable,menuItem,true);
                    setTimeout(function(){
                        ctx.fillStyle = "#000000";

                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    },speed *1);
                    setTimeout(function(){
                        drawMenuText(wiz.allShowsAvailable,menuItem,true);
                    },speed *2);
                    setTimeout(function(){
                        ctx.fillStyle = "#000000";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    },speed *3);
                    setTimeout(function(){
                        drawMenuText(wiz.allShowsAvailable,menuItem,true);
                    },speed *4);
                    setTimeout(function(){
                        ctx.fillStyle = "#000000";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    },speed *5);
                    setTimeout(function(){
                        console.log('showMenu selection:'+wiz.allShowsAvailable[menuItem-1]);
                        // add code for new show selected  here:
                        websocketsend('selectshow',{ShowName:wiz.allShowsAvailable[menuItem-1]});

                        sysState='idle'

                    },speed *6);
                    // setTimeout(function(){
                    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
                    // },speed *7)
                    break;
            }
            break;

        case 'systemMenu':
            switch(s){
                case 1:
                    --menuItem;
                    if (menuItem<1){
                        menuItem=1;
                    }

                    drawMenuText(systemMenu,menuItem);

                    break;
                case 2:
                    ++menuItem;
                    if (menuItem>systemMenu.length){
                        menuItem=systemMenu.length;
                    }
                    console.log('menuitem:'+menuItem);
                    drawMenuText(systemMenu,menuItem);

                    break;
                case 3:
                    // langauge selected
                    sysState = 'idle';
                    speed = 150;
                    //console.log('show/'+wiz.ShowName+'/'+languageList[menuItem-1]+'/AUDA1.mp3');
                    ctx.fillStyle = "#000000";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    drawMenuText(systemMenu,menuItem,true);
                    setTimeout(function(){
                        ctx.fillStyle = "#000000";

                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    },speed *1);
                    setTimeout(function(){
                        drawMenuText(systemMenu,menuItem,true);
                    },speed *2);
                    setTimeout(function(){
                        ctx.fillStyle = "#000000";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    },speed *3);
                    setTimeout(function(){
                        drawMenuText(systemMenu,menuItem,true);
                    },speed *4);
                    setTimeout(function(){
                        ctx.fillStyle = "#000000";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    },speed *5);
                    setTimeout(function(){
                            console.log('systemMenu selection:'+systemMenu[menuItem-1]);
                            // add code for menuFuntion here:
                            switch(systemMenu[menuItem-1]){
                                case 'Exit':
                                    sysState = 'idle';
                                    break;
                                case 'Select Language':
                                    menuItem = 1;
                                    drawMenuText(languageList,menuItem);
                                    sysState = 'languageMenu';
                                    break;
                                case 'Select Show':
                                    menuItem = 1;
                                    drawMenuText(wiz.allShowsAvailable,menuItem);
                                    sysState = 'selectShowMenu';
                                    break;
                                case 'Unit Status':
                                    menuItem = 1;
                                    drawMenuText(wiz.allShowsAvailable,menuItem);
                                    sysState = 'Unit Status';
                                    drawUnitStatus();


                                    break;

                                default:
                                    console.log('unprocessed system menu item:'+systemMenu[menuItem-1])


                            }

                    },speed *6);
                    // setTimeout(function(){
                    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
                    // },speed *7)
                    break;
            }
            break;

        case 'languageMenu':
            switch(s){
                case 1:
                    --menuItem;
                    if (menuItem<1){
                        menuItem=1;
                    }
                    console.log('menuitem:'+menuItem);
                    drawMenuText(languageList,menuItem);

                    break;
                case 2:
                    ++menuItem;
                    if (menuItem>languageList.length){
                        menuItem=languageList.length;
                    }
                    console.log('menuitem:'+menuItem);
                    drawMenuText(languageList,menuItem);

                    break;
                case 3:
                    // langauge selected
                    sysState = 'idle';
                    speed = 150;
                    //console.log('show/'+wiz.ShowName+'/'+languageList[menuItem-1]+'/AUDA1.mp3');
                    wiz.Directory = languageList[menuItem-1];
                 //   audio = new Audio('show/'+wiz.ShowName+'/'+wiz.Directory+'/AUDA0.mp3');
                 //   audio.play();

                    ctx.fillStyle = "#000000";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    drawMenuText(languageList,menuItem,true);
                    setTimeout(function(){
                        ctx.fillStyle = "#000000";

                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    },speed *1);
                    setTimeout(function(){
                        drawMenuText(languageList,menuItem,true);
                    },speed *2);
                    setTimeout(function(){
                        ctx.fillStyle = "#000000";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    },speed *3);
                    setTimeout(function(){
                        drawMenuText(languageList,menuItem,true);
                    },speed *4);
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
            sysState = 'adjustingvolume';
            switch(s){
                case 1:
                    wiz.Volume = (wiz.Volume*1) + 10;
                    break;
                case 2:
                    wiz.Volume = (wiz.Volume*1) - 10;
                    break;
            }

            if (typeof(audio) == 'object'){
                audio.volume = wiz.Volume/100;
            }
            drawVolume();
            console.log('Volume:'+wiz.Volume);
            break;

    }
}
function getLanguages(){
    var rv = [];
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
    ctx.font = (200/itemsToDisplay)*scale+'px Verdana';
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
        ctx.fillText(list[i],(settings.webPage.width/2)-(ctx.measureText(list[i]).width/2),(counter*(settings.webPage.height/(itemsToDisplay+1)))+20*scale);

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
                    case "unitStatus":
                        if (sysState == "Unit Status"){
                            drawUnitStatus(true,x.data);
                        }else {
                            console.log('Unit Status Recieved in wrong state - ignoring')
                        }

                        break;

                    case "reload":
                        location.reload();
                        break;
                    case "simbutton":
                        switchPress(x.data);
                        break;
                    case "cue":
                        console.log('cue - data:'+x.data);
                        switch (x.type)
                        {
                            case 'slide':
                               displaySlide(x.data);
                                break;
                            case 'audio':
                                playAudio(x.data);
                                break;
                            case 'video':
                                playVideo(x.data);
                                break;
                            default:
                               console.log('Unhandled extension:'+x.type);
                                break;


                        }
                        break;
                    case  "pageupdate":
                        document.getElementById("body").innerHTML = x.data.html;
                        console.log('HTML BODY UPDATE');
                        break;
                    case "fully":
                        if (x.parms){

                            fully[x.cmd](x.parms);
                        }else
                        {
                            fully[x.cmd]();

                        }
                        break;
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
function displaySlide(d) {
    console.log('display slide:' + d);
    sysState = 'fadeinslide'; // set mode to fadein
    ctx.fillStyle = "black";
    ctx.globalAlpha = 1;

    ctx.fillRect(0, 0, canvas.width, canvas.height); // clear the screen
    img = new Image();
    console.log('image:' + 'show/' + wiz.ShowName + '/' + wiz.Directory+ '/' + d);
    img.onload = function () {
        console.log('onload');
        //ctx.drawImage(img, 0, 0, img.width, img.height);


        ctx.globalAlpha = 0;
        fadeTime = wiz.FadeIn * 1000;
        startTime = false;
        fadeIn();
        console.log('fading in')

    };
    img.src = '/show/' + wiz.ShowName + '/' + wiz.Directory + '/' + d;
}
function drawUnitStatus(unitinfo,data){
    if (unitinfo){
        console.log('got unit info from server')
        ctx.globalAlpha = 1;
        //drawImage();
        ctx.font = '17px Verdana';
        ctx.fillStyle = "#00FF00";
        ctx.fillText(data.Battery, 670,260);
        ctx.fillText(data.Pan, 670,303); // service
        ctx.fillText(data.Signal, 670,346);
        ctx.fillText(data.Temperature, 670,389);

    }else
    {
        img = new Image();
        console.log('Loading Unit Status Image');
        img.onload = function () {
            websocketsend('requestunitstatus',{ShowName:wiz.allShowsAvailable[menuItem-1]});
            console.log('unit status image loaded');
            ctx.globalAlpha = 1;
            drawImage();
            ctx.font = '17px Verdana';
            ctx.fillStyle = "#00FF00";
            ctx.fillText(wiz.ShowName, 250,260);
            ctx.fillText(wiz.Directory, 250,303); // service
            ctx.fillText(wiz.Volume, 250,346);
            ctx.fillText(wiz.Backlight, 250,389);
        };
        img.src = '/show/icaption status screen.jpg';


    }

}
function fadeIn(t){
        if (fadeTime == 0 ){
        return
    }

    if (!startTime) {
        startTime = t;
    console.log('starttime'+startTime)
    }
    ctx.globalAlpha =1;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = (t-startTime) /fadeTime;
    drawImage();
    if (!startTime || t-startTime < fadeTime ){
        requestAnimationFrame(fadeIn)
    } else{
        console.log ('fade done displayslide');
        sysState = 'displayslide'; // set mode to show
        clearTimeout(fadeOutTimer); // clear the fade if it is already set from another slide
        fadeOutTimer = setTimeout(function(){
           console.log('fadeout timer set');
            if (sysState == 'displayslide')
            {
                sysState = 'fadeoutslide'; // set mode to fadein
                ctx.globalAlpha = 1;
                fadeTime = wiz.FadeOut*1000;
                startTime = false;
                console.log('fade out');

                fadeOut();


            }

        },(wiz.OnTime*1000))
    }



}
function fadeOut(t){

    if (fadeTime == 0 ){
        return
    }

    if (!startTime) {
        startTime = t;
        console.log('starttime'+startTime)
    }
    ctx.globalAlpha =1;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.01- ((t-startTime) /fadeTime);

    drawImage();
    if (!startTime || t-startTime < fadeTime ){
        requestAnimationFrame(fadeOut)
    } else{
        console.log (t-startTime);
        sysState = 'idle'; // set mode to idle
    }

}
function playVideo(d){
    sysState = 'playvideo'; // set mode to video -
    video.type = "video/mp4";
    video.src = 'show/'+wiz.ShowName+'/'+wiz.Directory+'/'+d

}
function playAudio(d){
    sysState = 'playaudio'; // set mode to audio -
    if (typeof(audio) == 'object'){
        audio.pause();
    }

    audio = new Audio('show/'+wiz.ShowName+'/'+wiz.Directory+'/'+d);
    //if (typeof(audio) == 'object'){
        audio.volume = wiz.Volume/100;
    //}
    audio.onended=function(){
        console.log('playback ended');
        if (sysState == 'adjustingvolume'){
            setTimeout(function(){
                if (sysState == 'adjustingvolume'){

                    sysState = 'idle'
                }

                },5000)



        } else
        {
            sysState = 'idle'; // set mode to idle
        }

    };
    audio.onerror=function(){
        console.log('playback error');
        sysState = 'idle'; // set mode to show
    };

    audio.play();



}
function drawImage(){
    x2 = img.width*(canvas.height/img.height);
    x1 = (canvas.width-x2)/2;
    ctx.drawImage(img, x1, 0, x2, canvas.height);


}
function drawVolume() {
    fadeTime = 0; // stop the fading
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height); // clear the screen
    if (typeof(img) == "object") {
        drawImage()
    }
    ctx.font = (200 / itemsToDisplay) * scale + 'px Verdana';
    ctx.fillStyle = "#00FF00";

    var displayText = "Volume:" + wiz.Volume;
    ctx.fillText(displayText, (canvas.width / 2) - (ctx.measureText(displayText).width / 2), canvas.height * .9);

    clearTimeout(volTimer);
    volTimer = setTimeout(function(){
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height); // clear the screen
        if (typeof(img) == "object") {
            drawImage()
        }

        console.log('volume timeout')
    },volumeTimeout)
}


