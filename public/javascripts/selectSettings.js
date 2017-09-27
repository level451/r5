var pagename ='r6';
function load() {
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
    sv = document.getElementById("selectedSettingsFile");
    sv.value = 0
    websockstart();
}
function switchPress(s){
    switch(s){
        case 2:

            if ((sv.value*1) >= settings.availableSettings.length-1){
                } else {

                ++sv.value
            }
            break;
        case 1:

            --sv.value
           if ((sv.value*1) < 1){
              sv.value =0}
            break;
        case 3:
            confirm();
            break;
        default:
    }

}

function websockstart(){
    ws = new ReconnectingWebSocket(wsUri);
    ws.onopen = function(evt){
        console.log("websocket connected");
        websocketsend('setwebpage',{pagename:pagename});
        websocketsend('backlightOn', {}); // turn on backlight



    };
    ws.onmessage = function(evt) {
        switch (typeof(evt.data)){
            case 'string':
                var x = JSON.parse(evt.data);
                switch(x.object){
                    case "simbutton":
                        switchPress(x.data);
                        break;
                    case "reloadPageDelay":
                        document.getElementById('info').innerText="Success! Restarting Please Wait";
                    console.log('reloading webpage - after 8 seconds')
                        setTimeout(function(){
                            location.reload();

                        },10000)
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
function confirm(){
    console.log('confirm')
    websocketsend('setsettings',{settingsFile:settings.availableSettings[sv.value]});
    console.log(settings.availableSettings[sv.value])
    sv.remove();
    document.getElementById('info').innerText="Saving File ...";
    document.getElementById('confirm').remove();
}
