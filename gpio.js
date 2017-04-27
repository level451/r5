/**
 * Created by steve on 4/26/2017.
 */
//if(os.type() != 'Windows_NT') {
    var Gpio = require('onoff').Gpio;
//}



exports.pwm = function(){

    var Gpio = require('onoff').Gpio,
        led = new Gpio(78, 'out'),
        button = new Gpio(4, 'in', 'both');

     console.log("writing  0");
        led.writeSync(1);


}