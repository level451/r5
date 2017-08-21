var pagename ='r6';
var events = [];
var inttimer = null;
var offset = 0;
var audio;
const itemsToDisplay =10;
const volumeTimeout = 3000; // used for volume and backlight
var volTimer = 0;
var backlightTimer = 0;
var fadeOutTimer = -1;
var specialMode = '';
const systemMenu = ['Exit','Select Language','Select Show','Unit Status','Test Mode','Demo Mode','Update Unit',];
var inSystemMenu = false;
var slideHistoryPointer = 0;
var slideHistory = [];
var slideHistroyMode = false;
var testModeData=[];
var testModeSignal=[];
var demoMode = false;
var demoModePointer = 0;
const userMenu = ['Exit','Volume','Brightness'];
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
    disp.style.overflow = "hidden";
    disp.style.cursor = "none";

    disp.style.transform = "rotate(" + settings.webPage.rotation + "deg)";

    canvas = document.getElementById('canvas');
    video = document.getElementById('video');
    display = document.getElementById('display');
    ctx = canvas.getContext('2d');

    canvas.click();
    canvas.width=settings.webPage.width;
    canvas.height=settings.webPage.height;
    video.width=settings.webPage.width;
    video.height=settings.webPage.height;


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

    canvas.addEventListener("click", canvasClick, false);
    welcomeImage = new Image();
    welcomeImage.src = 'show/'+wiz.ShowName+'/Welcome.jpg';
    websockstart();


    welcomeImage.onerror = function(){
        console.log ('welcome image failure:'+'show/'+wiz.ShowName+'/Welcome.jpg')
        displayError('Welcome image failed to load:'+welcomeImage.src)

    };
    welcomeImage.onload = function() {
        setTimeout(function(){
            websocketsend('requestunitstatus',{});
            console.log('requested unit status')
        },17000);

        ctx.drawImage(welcomeImage,0,0,canvas.width,canvas.height)
        displayState = 'welcomeImage';
        audioState = 'idle';
        websocketsend('fadeIn', {});
        languageList = getLanguages();

        welcomeImageTimeout = setTimeout(function()
        {
            if (wiz.Directory && wiz.Directory != '') {
                websocketsend('fadeOut', {});
                setTimeout(function(){
                    if (displayState == 'welcomeImage')
                    {
                        ctx.fillStyle = "#000000";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        displayState = 'idle';

                    }
                },wiz.FadeOut)
            } else {

                menuItem = 1;
                drawMenuText(languageList, menuItem);
                displayState = 'languageMenu'
            }


        },wiz.OnTime*100
        )


        //websockstart();
    }

}
function switchPress(s){
    if (s == 6) {
        clearTimeout(backlightTimer);
        clearTimeout(volTimer);
        clearTimeout(welcomeImageTimeout);


        if (displayState == 'playvideo'){
            video.pause()
            audioState='idle'
        }
        if (specialMode){
            specialMode = false;
        }
        if (audioState == 'playaudio'){
            if (typeof(audio) == 'object'){ // if audio is an object at this point it is currently playing
                audio.pause();
                audioState = 'idle';
            }

        }
        websocketsend('backlightOn', {}); // turn on backlight
        inSystemMenu = true;
        if (demoMode){
            turnOffDemoMode(); // take out of demo mode
        }

        slideHistroyMode = false; //take of of slide history mode

        websocketsend('testModeOff', {}); // turn off test mode
        websocketsend('updateUnitModeOff',{});

        menuItem = 1;
        displayState = 'systemMenu';
        ctx.globalAlpha = 1;

        drawMenuText(systemMenu, menuItem);

        return;


    }
    if (demoMode && !specialMode && displayState != 'userMenu'){
        switch(s) {
            case 1:
                if (demoModePointer > 1){
                    demoModePointer--;
                } else
                {
                    demoModePointer = 1; // when demoMode starts forward or back will trigger cue 1
                }
                console.log('Demo Mode Cue #:'+demoModePointer)
                websocketsend('demoCue', {cue:demoModePointer});

                break;
            case 2:
                demoModePointer++;
                console.log('Demo Mode Cue #:'+demoModePointer)
                websocketsend('demoCue', {cue:demoModePointer});

        }


    }
    if (specialMode){
        switch (specialMode){
            case 'volume':
                switch(s){
                    case 1:
                        if (wiz.Volume < 100) {
                            wiz.Volume = (wiz.Volume*1) + 10;
                        }

                        break;
                    case 2:
                        if (wiz.Volume > 0){
                            wiz.Volume = (wiz.Volume*1) - 10;
                        }

                        break;
                    case 3:
                        clearTimeout(volTimer);
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "#000000";
                        if (displayState == 'playvideo'){
                            ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the screen
                        }else
                        {
                            ctx.fillRect(0, 0, canvas.width, canvas.height); // clear the screen
                        }
                        if (typeof(img) == "object") {
                            drawImage()
                        }
                        specialMode = '';
                        if (displayState == 'idle'){
                            websocketsend('fadeOut',{}); // turn off backlight
                        }
                        console.log('volume exit')
                        return;
                        break;
                }

                if (typeof(audio) == 'object'){
                    audio.volume = wiz.Volume/100;
                }
                if (typeof(video) == 'object'){
                    video.volume = wiz.Volume/100;
                }
                drawVolume();
                console.log('Volume:'+wiz.Volume);

            break;
            case 'backlight':
                switch(s){
                    case 1:
                        if (wiz.Backlight < 100) {
                            wiz.Backlight = (wiz.Backlight*1) + 10;
                        }

                        break;
                    case 2:
                        if (wiz.Backlight > 0){
                            wiz.Backlight = (wiz.Backlight*1) - 10;
                        }

                        break;
                    case 3:
                        clearTimeout(backlightTimer);
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = "#000000";
                        if (displayState == 'playvideo'){
                            ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the screen
                        }else
                        {
                            ctx.fillRect(0, 0, canvas.width, canvas.height); // clear the screen
                        }
                        if (typeof(img) == "object") {
                            drawImage()
                        }
                        specialMode = '';
                        if (displayState == 'idle'){
                            websocketsend('fadeOut',{}); // turn off backlight
                        }
                        console.log('backlight exit')
                        return;
                        break;
                }


                drawBacklight();
                console.log('Backlight:'+wiz.Backlight);
                websocketsend('backlightOn', {backlight:wiz.Backlight}); // turn on backlight

                break;

        }




        return;
    }


    var speed;
if (audioState == 'idle' || displayState == 'userMenu') {
    switch (displayState) {
        case 'Test Mode':
            turnOffDemoMode()
            websocketsend('testModeOff', {});

        case 'UpdateUnit':
        // any switch from test or updateunit goes back to system menu
            inSystemMenu = true;
            websocketsend('updateUnitModeOff',{});
            menuItem = 1;
            displayState = 'systemMenu';
            testModeData = [];
            testModeSignal = [];
            ctx.globalAlpha = 1;
            drawMenuText(systemMenu, menuItem);


            // any switch from test mode goes back to idle
            //            displayState = 'idle';
            //            inSystemMenu = false;
            //            ctx.fillStyle = "#000000";
            //            ctx.fillRect(0, 0, canvas.width, canvas.height);
            //            websocketsend('fadeOut',{}); // turn off backlight
            //            // clear the signal and data

            break;


        case 'userMenu':

            switch (s) {
                case 1:
                    --menuItem;
                    if (menuItem < 1) {
                        menuItem = 1;
                    }

                    drawMenuText(userMenu, menuItem);

                    break;
                case 2:
                    ++menuItem;
                    if (menuItem > userMenu.length) {
                        menuItem = userMenu.length;
                    }
                    drawMenuText(userMenu, menuItem);

                    break;
                case 3:
                    // usermenu item selected
                    displayState = 'idle';
                    ctx.fillStyle = "#000000";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    // code here for user selection
                    switch (userMenu[menuItem - 1]) {
                        case 'Exit':
                            displayState = 'idle';
                            websocketsend('fadeOut', {}); // turn off backlight
                            break;
                        case 'Volume':
                            specialMode = 'volume';
                            drawVolume();
                            break;
                        case 'Brightness':
                            specialMode = 'backlight';
                            drawBacklight();

                            break;
                        default:
                            displayState = 'idle';
                            websocketsend('fadeOut', {}); // turn off backlight
                            console.log('unprocessed user menu item:' + systemMenu[menuItem - 1])


                    }


                    // setTimeout(function(){
                    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
                    // },speed *7)
                    break;
            }
            break;
        case 'fadeinslide':
        case 'fadeoutslide':
        case 'displayslide':
        case 'idle':
            //case 'languageMenu':
            switch (s) {
                case 1:
                    if (!demoMode) { // disable slide history in demo mode
                        slideHistroyMode = true;
                        if (displayState != 'idle') { // if idle just display the current slide
                            if (slideHistoryPointer < slideHistory.length - 1) { // not at the end of the slides
                                slideHistoryPointer++;
                            } else {
                                break; // if we dont move the slideHistoryPointer - dont display it again
                            }
                        }
                        if (slideHistory.length > 0) {
                            displaySlide(slideHistory[slideHistoryPointer])
                        }
                    }
                    break;
                case 2:
                    if (!demoMode) { // disable slide history in demo mode
                        slideHistroyMode = true;
                        console.log('slideHistoryPointer:' + slideHistoryPointer)
                        if (displayState != 'idle') { // if idle just display the current slide
                            if (slideHistoryPointer > 0) { // not at the begining of the slides
                                slideHistoryPointer--;
                            } else {
                                break; // if we dont move the slideHistoryPointer - dont display it again
                            }
                        }
                        if (slideHistory.length > 0) {
                            displaySlide(slideHistory[slideHistoryPointer])
                        }
                    }
                    break;
                case 3:
                    //if (displayState == 'idle') { // has to be idle?
                        // enter pressed while idle - goto userMenu
                        clearTimeout(welcomeImageTimeout);
                        websocketsend('backlightOn', {}); // turn on backlight

                        menuItem = 1;
                        displayState = 'userMenu';
                        ctx.globalAlpha = 1;
                        drawMenuText(userMenu, menuItem);
                    //}
                    break;

                case 6:
                    // special menu code - go to system menu
                    clearTimeout(welcomeImageTimeout)
                    if (displayState == 'idle') {
                        websocketsend('backlightOn', {}); // turn on backlight
                        inSystemMenu = true;
                        turnOffDemoMode()
                        menuItem = 1;
                        displayState = 'systemMenu';
                        ctx.globalAlpha = 1;

                        drawMenuText(systemMenu, menuItem);
                        break;
                    }
            }
            break;
        case 'Unit Status':
            switch (s) { // any switch press of switch 1, 2 or 3 in unit status will exit to idle
                case 1:
                case 2:
                case 3:
                case 6:
                    //always go back to system menu from unit status
                    inSystemMenu = true;
                    turnOffDemoMode()
                    menuItem = 1;
                    displayState = 'systemMenu';
                    ctx.globalAlpha = 1;
                    drawMenuText(systemMenu, menuItem);

                    // ctx.fillStyle = "#000000";
                    // ctx.fillRect(0, 0, canvas.width, canvas.height);
                    // displayState = 'idle';
                    // inSystemMenu = false; //this blocks ques from executing when true
                    break;
            }
            break;
        case 'selectShowMenu':
            switch (s) {
                case 1:
                    --menuItem;
                    if (menuItem < 1) {
                        menuItem = 1;
                    }

                    drawMenuText(wiz.allShowsAvailable, menuItem);

                    break;
                case 2:
                    ++menuItem;
                    if (menuItem > wiz.allShowsAvailable.length) {
                        menuItem = wiz.allShowsAvailable.length;
                    }
                    console.log('menuitem:' + menuItem);
                    drawMenuText(wiz.allShowsAvailable, menuItem);

                    break;
                case 3:
                    // show selected
                    displayState = 'idle';
                    speed = 150;
                    //console.log('show/'+wiz.ShowName+'/'+languageList[menuItem-1]+'/AUDA1.mp3');
                    ctx.fillStyle = "#000000";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    drawMenuText(wiz.allShowsAvailable, menuItem, true);
                    setTimeout(function () {
                        ctx.fillStyle = "#000000";

                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }, speed * 1);
                    setTimeout(function () {
                        drawMenuText(wiz.allShowsAvailable, menuItem, true);
                    }, speed * 2);
                    setTimeout(function () {
                        ctx.fillStyle = "#000000";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }, speed * 3);
                    setTimeout(function () {
                        drawMenuText(wiz.allShowsAvailable, menuItem, true);
                    }, speed * 4);
                    setTimeout(function () {
                        ctx.fillStyle = "#000000";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }, speed * 5);
                    setTimeout(function () {
                        console.log('showMenu selection:' + wiz.allShowsAvailable[menuItem - 1]);
                        // add code for new show selected  here:
                        websocketsend('selectshow', {ShowName: wiz.allShowsAvailable[menuItem - 1]});
                        displayState = 'idle'
                        inSystemMenu = false; //this blocks ques from executing when true
                    }, speed * 6);
                    // setTimeout(function(){
                    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
                    // },speed *7)
                    break;
            }
            break;

        case 'systemMenu':
            switch (s) {
                case 1:
                    --menuItem;
                    if (menuItem < 1) {
                        menuItem = 1;
                    }

                    drawMenuText(systemMenu, menuItem);

                    break;
                case 2:
                    ++menuItem;
                    if (menuItem > systemMenu.length) {
                        menuItem = systemMenu.length;
                    }
                    console.log('menuitem:' + menuItem);
                    drawMenuText(systemMenu, menuItem);

                    break;
                case 3:
                    // langauge selected
                    displayState = 'idle';
                    speed = 150;
                    //console.log('show/'+wiz.ShowName+'/'+languageList[menuItem-1]+'/AUDA1.mp3');
                    ctx.fillStyle = "#000000";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    drawMenuText(systemMenu, menuItem, true);
                    setTimeout(function () {
                        ctx.fillStyle = "#000000";

                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }, speed * 1);
                    setTimeout(function () {
                        drawMenuText(systemMenu, menuItem, true);
                    }, speed * 2);
                    setTimeout(function () {
                        ctx.fillStyle = "#000000";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }, speed * 3);
                    setTimeout(function () {
                        drawMenuText(systemMenu, menuItem, true);
                    }, speed * 4);
                    setTimeout(function () {
                        ctx.fillStyle = "#000000";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }, speed * 5);
                    setTimeout(function () {
                        console.log('systemMenu selection:' + systemMenu[menuItem - 1]);
                        // add code for menuFuntion here:
                        switch (systemMenu[menuItem - 1]) {
                            case 'Exit':
                                displayState = 'idle';
                                inSystemMenu = false; //this blocks ques from executing when true
                                websocketsend('fadeOut',{}); // turn off backlight

                                break;

                            case 'Select Language':
                                menuItem = 1;
                                drawMenuText(languageList, menuItem);
                                displayState = 'languageMenu';
                                break;
                            case 'Select Show':
                                menuItem = 1;
                                drawMenuText(wiz.allShowsAvailable, menuItem);
                                displayState = 'selectShowMenu';
                                break;
                            case 'Unit Status':
                                menuItem = 1;
                                drawMenuText(wiz.allShowsAvailable, menuItem);
                                displayState = 'Unit Status';
                                drawUnitStatus();
                                break;
                            case 'Test Mode':
                                menuItem = 1;
                                displayState = 'Test Mode';
                                drawTestMode();
                                break;
                            case 'Demo Mode':
                                demoMode = true;
                                websocketsend('demoModeOn', {});
                                inSystemMenu = false; //this blocks ques from executing when true
                                menuItem = 1;
                                displayState = 'idle';

                                break;
                            case 'Update Unit':
                                displayState = 'UpdateUnit';
                                drawUpdateUnit();
                                break;

                            default:
                                console.log('unprocessed system menu item:' + systemMenu[menuItem - 1])


                        }

                    }, speed * 6);
                    // setTimeout(function(){
                    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
                    // },speed *7)
                    break;
            }
            break;

        case 'languageMenu':
            switch (s) {
                case 1:
                    --menuItem;
                    if (menuItem < 1) {
                        menuItem = 1;
                    }
                    console.log('menuitem:' + menuItem);
                    drawMenuText(languageList, menuItem);

                    break;
                case 2:
                    ++menuItem;
                    if (menuItem > languageList.length) {
                        menuItem = languageList.length;
                    }
                    console.log('menuitem:' + menuItem);
                    drawMenuText(languageList, menuItem);

                    break;
                case 3:
                    // langauge selected
                    displayState = 'idle';
                    inSystemMenu = false; //this blocks ques from executing when true
                    speed = 150;
                    //console.log('show/'+wiz.ShowName+'/'+languageList[menuItem-1]+'/AUDA1.mp3');
                    wiz.Directory = languageList[menuItem - 1];
                    websocketsend('setDirectory', {directory: wiz.Directory}); // turn on backlight

                    //   audio = new Audio('show/'+wiz.ShowName+'/'+wiz.Directory+'/AUDA0.mp3');
                    //   audio.play();

                    ctx.fillStyle = "#000000";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    drawMenuText(languageList, menuItem, true);
                    setTimeout(function () {
                        ctx.fillStyle = "#000000";

                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }, speed * 1);
                    setTimeout(function () {
                        drawMenuText(languageList, menuItem, true);
                    }, speed * 2);
                    setTimeout(function () {
                        ctx.fillStyle = "#000000";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }, speed * 3);
                    setTimeout(function () {
                        drawMenuText(languageList, menuItem, true);
                    }, speed * 4);
                    setTimeout(function () {
                        //erase the image
                        ctx.fillStyle = "#000000";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        //draw the welcome image
                        ctx.drawImage(welcomeImage,0,0,canvas.width,canvas.height)
                        displayState = 'welcomeImage';
                        audioState = 'idle';
                        websocketsend('fadeIn', {});
                        languageList = getLanguages();

                        welcomeImageTimeout = setTimeout(function()
                        {
                            if (wiz.Directory && wiz.Directory != '') {
                                websocketsend('fadeOut', {});
                                setTimeout(function(){
                                    if (displayState == 'welcomeImage')
                                    {
                                        ctx.fillStyle = "#000000";
                                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                                        displayState = 'idle';

                                    }
                                },wiz.FadeOut)
                            } else {

                                menuItem = 1;
                                drawMenuText(languageList, menuItem);
                                displayState = 'languageMenu'
                            }


                        },wiz.OnTime*1000
                        )


                    }, speed * 5)

                    break;
                case 6:
                    // special menu code - go to system menu
                    menuItem = 1;
                    displayState = 'systemMenu';
                    ctx.globalAlpha = 1;

                    drawMenuText(systemMenu, menuItem);
                    break;


            }
            break;

        case 'adjustingvolume':
            console.log('should not happen - adjust volume')

    }
} else{
    // audioState != idle
    switch(audioState){
        case 'playaudio':
            // key pressed in playaudio
            if (s == 1 || s == 2){
                specialMode = 'volume';
                drawVolume();

            }
            break;
        case 'playvideo':
            // key pressed in playvideo
            if (!demoMode) { // disable volume from video in demoMode
                if (s == 1 || s == 2){
                    specialMode = 'volume';
                    drawVolume();

                }

            }
            break;

    }

}

}
function getLanguages(){
    var rv = [];
    for (var key in wiz) {
        if (key.indexOf('Service') == 0  ){
            rv.push(wiz[key])
        }
    }
    return rv.sort();
}
function drawMenu(offset){
    ctx.putImageData(menu,0,offset)
}


function drawMenuText(list,item,itemonly){
    ctx.fillStyle = "#000000";

    ctx.fillRect(0, 0, canvas.width, canvas.height);
var yval;
var counter = 1;
 //   ctx.font = (200/itemsToDisplay)*scale+'px sans-serif'
    ctx.font = (200/itemsToDisplay)*scale+'px Verdana';
var drawup = false;
var drawdown = false;
    const spacingMultiplier = 1.25; //1.12; //line spacing
    const menuOffset =  2;//1; // select menu item location - range about -2 to 2
if (!itemonly){
    ctx.drawImage(welcomeImage,10,10,90*2,58*2)
}


//for (var i = item-(Math.floor(itemsToDisplay/2));i<(itemsToDisplay-(Math.floor(itemsToDisplay/2))+1);++i)
if (!itemonly){
    ctx.fillStyle = "#FFFF00";
    ctx.fillText('Please Select:',(settings.webPage.width/2)-(ctx.measureText('Please Select').width/2),60);
}



    for (var i = item-(Math.floor(itemsToDisplay/2))+menuOffset;i<list.length;++i) {
        if ((list[i] != undefined && !itemonly) || (itemonly && i == item - 1)) {

            if (i == item - 1) {
                ctx.fillStyle = "#ff0000";
            } else {
                ctx.fillStyle = "#FFFFFF";
            }
            yval = ((counter * (settings.webPage.height / (itemsToDisplay + 1)) * spacingMultiplier) + 20 * scale)
            if (yval > canvas.height * .25 && yval < canvas.height * .95) // dont display items too high or low
                ctx.fillText(list[i], (settings.webPage.width / 2) - (ctx.measureText(list[i]).width / 2), yval);
            console.log(yval)
        }
        if (yval <= canvas.height * .25) {
            drawup = true;

        }
        if (yval >= canvas.height * .95) {
            drawdown = true

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
if (drawup) {
    ctx.beginPath();
    ctx.strokeStyle="green";
    ctx.lineWidth=5;
    ctx.moveTo((canvas.width/2)-(canvas.width*.09),canvas.height * .19);
    ctx.lineTo((canvas.width/2),canvas.height * .15);
    ctx.lineTo((canvas.width/2)+(canvas.width*.09),canvas.height * .19);
    ctx.stroke();

    ctx.fillStyle = "#00ff00";

    ctx.font = (60/itemsToDisplay)*scale+'px Verdana';
    ctx.fillText('More', (settings.webPage.width / 2) - (ctx.measureText('More').width / 2), canvas.height*.19);
    console.log('draw up arrow')

}
if (drawdown){
    ctx.beginPath();
    ctx.strokeStyle="green";
    ctx.lineWidth=5;
    ctx.moveTo((canvas.width/2)-(canvas.width*.1),canvas.height * .95);
    ctx.lineTo((canvas.width/2),canvas.height * .99);
    ctx.lineTo((canvas.width/2)+(canvas.width*.1),canvas.height * .95);
    ctx.stroke();
    ctx.fillStyle = "#00ff00";

    ctx.font = (60/itemsToDisplay)*scale+'px Verdana';
    ctx.fillText('More', (settings.webPage.width / 2) - (ctx.measureText('More').width / 2), canvas.height*.97);


    console.log('draw down arrow')

}

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
                    case "testModeData":
                        testModeData.unshift(x.data);
                        testModeSignal.unshift('--');
                        //  console.log('TestModeData:'+x.data);
                        drawTestMode();
                        break;
                    case "testModeSignal":
                        testModeSignal[0]=x.data;
                        //console.log('TestModeSignal:'+x.data);
                        drawTestMode();
                        break;

                    case "unitStatus":
                        wiz.Battery = x.data.Battery;
                        wiz.Pan = x.data.Pan;
                        wiz.Signal = x.data.Signal;
                        wiz.Temperature = x.data.Temperature;
                        wiz.firmwaveVersion = x.data.firmwareVersion;
                        wiz.IPAddress = x.data.IPAddress;
                        wiz.MACAddress = x.data.MACAddress;
                        if (displayState == "Unit Status"){
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
                        if (displayState != 'idle'){
                            clearTimeout(welcomeImageTimeout);

                        }
                        if (displayState == 'playvideo'){
                            video.pause()
                            audioState='idle'
                            displayState='idle'

                        }
                        console.log('cue - data:'+x.data);
                        if (inSystemMenu == false){ //dont process cues in system menu
                            if (slideHistroyMode){
                                slideHistroyMode = false;
                                turnOffScreen();
                            }


                            switch (x.type)
                            {
                                case 'slide':

                                    slideHistoryPointer = 0; // reset review slide pointer
                                    if (!demoMode) // dont add to slide history in demo mode
                                    {
                                        // throw the cue slide into history
                                        slideHistory.unshift(x.data);
                                    }

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

                        } else
                        {
                            console.log('Cue iqnored becuase we are in system menu')
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
    displayState = 'fadeinslide'; // set mode to fadein
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
        websocketsend('fadeIn',{});
        fadeIn();
        console.log('fading in')

    };
    img.onerror=function(){
        console.log('image load error:'+img.src);
        displayState = 'idle'; // set mode to show
    };

    img.src = '/show/' + wiz.ShowName + '/' + wiz.Directory + '/' + d;
}
function drawUnitStatus(unitinfo,data){
    if (unitinfo){
        console.log('got unit info from server'+JSON.stringify(data))
        ctx.globalAlpha = 1;
        //drawImage();
        ctx.font = '17px Verdana';
        ctx.fillText(data.Battery, 675,193);
        ctx.fillText(data.Pan, 605,244); // service
        ctx.fillText(data.Signal, 697,294);
        ctx.fillText(data.Temperature, 673,344);
        ctx.fillText(data.firmwareVersion,295,444)
        ctx.fillText(data.IPAddress,620,442)
        ctx.fillStyle = "#FFFFFF";

        ctx.fillText('MAC:'+data.MACAddress,(settings.webPage.width/2)-(ctx.measureText('MAC:'+data.MACAddress).width/2),470);


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
            ctx.fillText(wiz.ShowName, 260,193);
            if (wiz.Version){
                ctx.fillText(wiz.Version, 260,243);
            }
            ctx.fillText(wiz.Directory, 275,293); // service
            ctx.fillText(wiz.Volume, 190,343);
            ctx.fillText(wiz.Backlight, 225,393);

            ctx.fillText(wiz.Ssid, 600,392);
        };
        img.src = '/show/icaption status screen.jpg';


    }

}
function fadeIn(t){
        if (fadeTime == 0 || displayState != 'fadeinslide'){

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
        displayState = 'displayslide'; // set mode to show
        clearTimeout(fadeOutTimer); // clear the fade if it is already set from another slide
        fadeOutTimer = setTimeout(function(){
           console.log('fadeout timer set');
            if (displayState == 'displayslide')
            {
                displayState = 'fadeoutslide'; // set mode to fadein
                ctx.globalAlpha = 1;
                fadeTime = wiz.FadeOut*1000;
                startTime = false;
                console.log('fade out');
                websocketsend('fadeOut',{});

                fadeOut();


            }

        },(wiz.OnTime*1000))
    }



}
function fadeOut(t){

    if (fadeTime == 0  || displayState != 'fadeoutslide' ){
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
        ctx.globalAlpha =1;
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        displayState = 'idle'; // set mode to idle
    }

}
function playVideo(d){
    video.type = "video/mp4";


    video.oncanplay = function(){
        websocketsend('fadeIn',{});
        console.log("playback can begin");
        displayState = 'playvideo'; // set mode to video -
        audioState = 'playvideo';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        video.volume = wiz.Volume/100;
        video.play()
    }

    video.onended = function(){
        console.log("playback ended");
        websocketsend('fadeOut',{});
        setTimeout(function(){        ctx.globalAlpha = 1; // erase the screen after the backlight is off
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        },wiz.FadeOut*1000);
        audioState = 'idle';
        displayState = 'idle'; // set mode to video -
    };
    video.onerror = function(){
        console.log('video onerror')
        websocketsend('fadeOut',{});
        ctx.globalAlpha = 1; // erase the screen after the backlight is off
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

        displayState = 'idle'; // set mode to video -

    }
    video.src = 'show/'+wiz.ShowName+'/'+wiz.Directory+'/'+d
}
function playAudio(d){
    audioState = 'playaudio'; // set mode to audio -
    if (typeof(audio) == 'object'){ // if audio is an object at this point it is currently playing - so pause it - then start a new audio file
        audio.pause();
    }

    audio = new Audio('show/'+wiz.ShowName+'/'+wiz.Directory+'/'+d);
    audio.onplay=function(){
        audio.volume = wiz.Volume/100;
    }


    audio.onended=function(){
        console.log('playback ended');
        if (displayState == 'adjustingvolume'){
            setTimeout(function(){
                if (displayState == 'adjustingvolume'){
                    displayState = 'idle'
                    audioState = 'idle'
                }

                },volumeTimeout)



        } else
        {
            audioState = 'idle'; // set mode to idle
        }

    };
    audio.onerror=function(){
        console.log('playback error');
        audioState = 'idle'; // set mode to show
    };

    audio.volume = wiz.Volume/100;
    audio.play();



}
function drawImage(){
    x2 = img.width*(canvas.height/img.height);
    x1 = (canvas.width-x2)/2;
    ctx.drawImage(img, x1, 0, x2, canvas.height);


}
function drawVolume() {
    websocketsend('backlightOn',{});


    fadeTime = 0; // stop the fading
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height); // clear the screen

    if (displayState == 'playvideo'){
        ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the screenq
    }else
    {
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height); // clear the screen
    }

    if (typeof(img) == "object" && displayState != 'playvideo' && displayState != 'idle' ) {
        // only redraw image if image is be
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
        if (displayState == 'playvideo'){
            ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the screen
        }else
        {
            ctx.globalAlpha =1;
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height); // clear the screen
            if (typeof(img) == "object" && displayState !='idle') {
                drawImage()
            }
            if (displayState == 'fadeoutslide'){

                ctx.globalAlpha = 1;
                fadeTime = wiz.FadeOut*1000;
                startTime = false;
                console.log('fade out');
                websocketsend('fadeOut',{});

                fadeOut();
            }
        }

        specialMode = '';
        if (displayState == 'idle'){
            websocketsend('fadeOut',{}); // turn off backlight
        }

        console.log('volume timeout')
    },volumeTimeout)
}
function drawBacklight() {
    websocketsend('backlightOn',{});


    fadeTime = 0; // stop the fading
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height); // clear the screen

    if (displayState == 'playvideo'){
        ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the screenq
    }else
    {
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height); // clear the screen
    }

    if (typeof(img) == "object" && displayState != 'playvideo' ) {
        drawImage()

    }
    ctx.font = (200 / itemsToDisplay) * scale + 'px Verdana';
    ctx.fillStyle = "#00FF00";

    var displayText = "Brightness:" + wiz.Backlight;
    ctx.fillText(displayText, (canvas.width / 2) - (ctx.measureText(displayText).width / 2), canvas.height * .9);

    clearTimeout(backlightTimer);
    backlightTimer = setTimeout(function(){
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#000000";
        if (displayState == 'playvideo'){
            ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the screen
        }else
        {
            ctx.globalAlpha =1;
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height); // clear the screen
        }
        if (typeof(img) == "object") {
           drawImage()
       }

        if (displayState == 'fadeoutslide'){

            ctx.globalAlpha = 1;
            fadeTime = wiz.FadeOut*1000;
            startTime = false;
            console.log('fade out');
            websocketsend('fadeOut',{});

            fadeOut();
        }
        specialMode = '';
        if (displayState == 'idle'){
            websocketsend('fadeOut',{}); // turn off backlight
        }

        console.log('backlight timeout')
    },volumeTimeout)
}

function displayError(error){

    ctx.globalAlpha = 1;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height); // clear the screen


    ctx.fillStyle = "#FF0000";
    ctx.font = '30px Verdana';
    ctx.fillText('ERROR - System Malfunction', (canvas.width / 2) - (ctx.measureText('ERROR - System Malfunction').width / 2), 50);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = '15px Verdana';

    ctx.fillText(error,10,100)

    ctx.fillStyle = "#FFFFFF";
    ctx.font = '50px Verdana';
    ctx.fillText('Please exchange unit.', (canvas.width / 2) - (ctx.measureText('Please exchange unit.').width / 2), 250);


}
function drawTestMode(){
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height); // clear the screen

    ctx.font = '23px Verdana';
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText('Test Mode', 50,20);
    ctx.fillText('Data', 250,20);
    ctx.fillText('Sig', 747,20);
    ctx.beginPath();
    ctx.strokeStyle="white";
    ctx.lineWidth=2;
    ctx.moveTo(0,27);
    ctx.lineTo(canvas.width,27);

    ctx.stroke();


    websocketsend('testModeOn',{});
    for (var i = 0;i<15;++i){
        if (testModeData[i]){
            ctx.fillText(testModeData[i], 50,(i*30)+50);
        }
        if (testModeSignal[i]){
            ctx.fillText(testModeSignal[i], 750,(i*30)+50);

        }

    }




}
function canvasClick(e){
    var x,y
    switch (settings.webPage.rotation){
        case 0:
            x= e.pageX
            y = e.pageY
            break;
        case 90:
            x=(e.pageY)

            y=(canvas.height - e.pageX)
    }

    console.log(x,y)

}
function turnOffDemoMode() {
    websocketsend('demoModeOff',{});
    demoMode = false;
    demoModePointer = 0;

}

function turnOffScreen(){
    websocketsend('fadeOut', {}); // turn off backlight

    ctx.globalAlpha = 1;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height); // clear the screen

}
function drawUpdateUnit(){
    websocketsend('updateUnitModeOn',{});
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height); // clear the screen

    ctx.font = '30px Verdana';
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText('Update Unit', 50,25);
        ctx.beginPath();
    ctx.strokeStyle="white";
    ctx.lineWidth=2;
    ctx.moveTo(0,37);
    ctx.lineTo(canvas.width,37);
    if (!wiz.IPAddress){
        ctx.fillText('Unable to obtain unit ipaddress - requesting ...', 50,120);
        ctx.fillText('Press any button and try again', 50,160);
        websocketsend('requestunitstatus',{});
    } else
    {
        ctx.fillText('Please go to this URL', 50,120);
        ctx.strokeStyle="green";

        ctx.fillText('http://'+wiz.IPAddress+':'+settings.webServer.listenPort+'/updateunit', 50,160);
        ctx.strokeStyle="white";

        ctx.fillText('In a web browser to upload or update show files', 50,200);
}

    ctx.stroke();
}