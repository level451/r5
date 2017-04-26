/**
 * Created by steve on 4/26/2017.
 */

var Gpio = require('pigpio').Gpio;

exports.gpiotest = function () {
    switch1 = new Gpio(4,{
        mode: Gpio.INPUT,
        pullUpDown: Gpio.PUD_UP,
        edge: Gpio.EITHER_EDGE
    }),
    led1 = new Gpio(17,{mode: Gpio.OUTPUT});

    switch1.on('interrupt', function(level){
        led1.digitalWrite(level);
        console.log("outputting " + level);
    });

}