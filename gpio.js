/**
 * Created by steve on 4/26/2017.
 */

var gpio = require('pigpio');

exports.gpiotest = function () {
    switch1 = new gpio(4,{
        mode: gpio.INPUT,
        pullUpDown: gpio.PUD_UP,
        edge: gpio.EITHER_EDGE
    }),
    led1 = new gpio(17,{mode: gpio.OUTPUT});

    switch1.on('interrupt', function(level){
        led1.digitalWrite(level);
    });

}