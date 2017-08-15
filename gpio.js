/**
 * Created by steve on 4/26/2017.
 */

//  ***************************************************************
//  ***************************************************************
//         to find base address of chips: do this:

//         # cd /sys/class/gpio

//         # for i in gpiochip* ; do  echo `cat $i/label`: `cat $i/base` ; done
//
//  ***************************************************************
//  ***************************************************************


//  Nanopi S2 GPIO base addresses
// GPIOA: 0
// GPIOE: 128
// GPIOALV: 160
// GPIOB: 32
// GPIOC: 64
// GPIOD: 96
//
//      NanpPi S2  pin vs gpio#

//  Pin#        GPIO#
//   12          108
//   13          62  - switch4
//   15          63  - switch1
//   16          78
//   18          59  - switch3
//   26          58  - switch2
//   29          72
//   31          71
//   32          92
//   33          77
    //physical layout:
    //  switch1         switch3               switch2
    //     X               X                     X

//websocket = require("./websocket.js");
var os = require('os');
var switch1;
var switch2;
var switch3;
var audioControl
var switchBlock = 0;
if(os.type() != "Windows_NT") {
    var Gpio = require('onoff').Gpio,
        //  led = new Gpio(59, 'out'),
        //   button = new Gpio(78, 'in', 'both');
    switch1 = new Gpio(63, 'in', 'both'); //left
    switch2 = new Gpio(58, 'in', 'both'); // right
    switch3 = new Gpio(59, 'in', 'both'); //center
    audioControl = new Gpio(63, 'out')
    var switch3Timeout;
}
const xbee = require("./Xbee");
const llibR6 = require("./llibR6");
console.log("Operating system is: " + os.type().toString());


exports.setupSwitches = function(){

    switch1.watch(function (err,value){
        if(err){
            console.log(err);
        }
        switch(value){
            case 0:
                sendSwitchData(1);
                   // llibR6.wifiandPanIdcheckandset(); //for testing only
                break;
            case 1:
                sendSwitchData(100);

                break;
        }

    });
    switch2.watch(function (err,value){
        if(err){
            console.log(err);
        }
        switch(value){
            case 0:
                sendSwitchData(2);
                break;
            case 1:
                sendSwitchData(200);
                break;
        }

    });
    switch3.watch(function (err,value){
        if(err){
            console.log(err);
        }
        switch(value){
            case 0:
                sendSwitchData(300);
                switch3Timeout = setTimeout(readAllSwitches,3500);
                break;
            case 1:
                sendSwitchData(3);
                clearTimeout(switch3Timeout);
                break;
        }

    });

}

function readAllSwitches(){//switch 3 is down and timed out
   var switchStatus = switch1.readSync()*1 + switch2.readSync()*2;
    switch(switchStatus){
        case 0: //switches 1 and 2 are down
            sendSwitchData(7);
            break;
        case 1: //switch 2 is down
            sendSwitchData(6);
            break;
        case 2: //switch 1 is down
            sendSwitchData(5);
            break;
        case 3: // no switches are  down
            sendSwitchData(4);
            break;
    }

}

function sendSwitchData(data){
    if(switchBlock == 1){
        return;
    }
    if((switchBlock == 0) && (data == 6)){ //after long press combination block everything else for 1 second
        switchBlock = 1;
        setTimeout(function(){switchBlock=0}, 1400);
    }
    console.log("Send switch data: " + data + " SwitchBlock: " + switchBlock);
    ws.send(JSON.stringify({object:'simbutton',data:data}),'r6'); // send the simulate4d button press data to all the 'r6' webpages
   // console.log("The switch value is: " + data);
}

exports.audioState = function(state){
    if(os.type() != "Windows_NT") {
        switch (state) {
            case 1:
            case 'on':
            case 'On':
            case 'ON':
                audiocontrol.writeSync(1);
                break;
            default:
                audioControl.writeSync(0);
        }
    }

}
