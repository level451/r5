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
//websocket = require("./websocket.js");
var os = require('os');
var switch1;
var switch2;
var switch3;

var Gpio = require('onoff').Gpio,
    //  led = new Gpio(59, 'out'),
    //   button = new Gpio(78, 'in', 'both');
switch1 = new Gpio(63, 'in', 'both'); //left
switch2 = new Gpio(59, 'in', 'both'); // right
switch3 = new Gpio(58, 'in', 'both'); //center

var switch3Timeout;
var switch4Timeout;
console.log("Operating system is: " + os.type().toString());


exports.setupSwitches = function(){

    console.log("Set up switches starting");

    switch1.watch(function (err,value){
        console.log("switch 1 something foing on");
        if(err){
            console.log(err);
        }
        switch(value){
            case 0:
                sendSwitchData(1);
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
                sendSwitchData(3);
                switch3Timeout = setTimeout(readAllSwitches,5000);
                break;
            case 1:
                sendSwitchData(300);
                clearTimeout(switch3Timeout);
                break;
        }

    });

}

function readAllSwitches(){//switch 3 is down and timed out
   var switchStatus = switch1.readSync()*0x01 + switch2.readSync()*0x10 + switch3.readSync()*0x100;
    switch(switchStatus){
        case 4: //switches 1 and 2 are down
            sendSwitchData(7);
            break;
        case 5: //switch 2 is down
            sendSwitchData(6);
            break;
        case 6: //switch 1 is down
            sendSwitchData(5);
            break;
        case 7: // no switches are down
            sendSwitchData(4);
            break;
    }

}

function sendSwitchData(data){
    ws.send(JSON.stringify({object:'simbutton',data:data}),'r6'); // send the simulate4d button press data to all the 'r6' webpages
    console.log("The switch value is: " + data);
}
