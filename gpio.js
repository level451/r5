/**
 * Created by steve on 4/26/2017.
 */

var pin = require('pigpio').Gpio;

exports.pintest = function () {
    switch1 = new pin(4,{
        mode: pin.INPUT,
        pullUpDown: pin.PUD_UP,
        edge: pin.EITHER_EDGE
    }),
    led1 = new pin(17,{mode: pin.OUTPUT});

    switch1.on('interrupt', function(level){
        led1.digitalWrite(level);
        console.log("outputting " + level);
    });

}

exports.pwm = function(){

    var Gpio = require('pigpio').Gpio,
        led = new Gpio(17, {mode: Gpio.OUTPUT});

    setInterval(function () {
        led.digitalWrite(led.digitalRead() ^ 1);
    }, 100);
}