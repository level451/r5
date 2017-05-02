var pagename ='cue';



function load() {


    websockstart();
    output = document.getElementById("logdata");

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
function sendcue(d){
    websocket.send('cue',d.innerText)

}
function sendcuebutton() {

    var cue = document.getElementById('cuenumber').value.trim();
    var showname = document.getElementById('showname').value;

   if (document.getElementById('slide').checked){
       packet = "Slide" + cue + ".jpg";
   }
    if (document.getElementById('auda').checked){
        packet = "AudA" + cue + ".mp3";
    }
    if (document.getElementById('audb').checked){
        packet = "AudB" + cue + ".mp3";
    }
    if (document.getElementById('audc').checked){
        packet = "AudC" + cue + ".mp3";
    }
    if (document.getElementById('video').checked){
        packet = "Slide" + cue + ".mp4";
    }

    totalpacket = "          " + showname + " " + "GO" + " " + packet + "\n\r";
    output.innerHTML = totalpacket + "<BR>" + output.innerHTML;
    websocketsend(cue, totalpacket);

    document.getElementById('cuenumber').value =  parseInt(document.getElementById('cuenumber').value) + 1; //increment counter
}


function sendcueautobutton(){
    if(document.getElementById('sendcueauto').innerHTML == "Send Cue Auto") {
        document.getElementById('sendcueauto').innerHTML = "Stop Cue Auto"  ;
        document.getElementById("sendcueauto").style.background='#FF0000';
        cueAuto(); //start settimeout and repeats forever -- unless stopped
    }
    else{
        document.getElementById('sendcueauto').innerHTML = "Send Cue Auto"  ;
        clearTimeout(autocount);
        document.getElementById("sendcueauto").style.background='#F1F1F1';
    }
}

function cueAuto(){
    var cue = document.getElementById('cuenumber').value.trim();
    var showname = document.getElementById('showname').value;

    if (document.getElementById('slide').checked){
        packet = "Slide" + cue + ".jpg";
    }
    if (document.getElementById('auda').checked){
        packet = "AudA" + cue + ".mp3";
    }
    if (document.getElementById('audb').checked){
        packet = "AudB" + cue + ".mp3";
    }
    if (document.getElementById('audc').checked){
        packet = "AudC" + cue + ".mp3";
    }
    if (document.getElementById('video').checked){
        packet = "Slide" + cue + ".mp4";
    }

    totalpacket = "          " + showname + " " + "GO" + " " + packet + "\n\r";
    output.innerHTML = totalpacket + "<BR>" + output.innerHTML;
    websocketsend(cue, totalpacket);

    document.getElementById('cuenumber').value =  parseInt(document.getElementById('cuenumber').value) + 1; //increment counter

    autocount = setTimeout(function(){cueAuto()}, parseInt(document.getElementById('cuetime').value)*1000);

    if(parseInt(document.getElementById('cuenumber').value)> 1000){
        document.getElementById('cuenumber').value = 1; //count to 1000 then repeat
    }
}