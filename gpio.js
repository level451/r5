/**
 * Created by steve on 4/26/2017.
 */
//if(os.type() != 'Windows_NT') {
    var Gpio = require('onoff').Gpio;
//}
//Nanopi S2 GPIO addresses
// GPIOA: 0
// GPIOE: 128
// GPIOALV: 160
// GPIOB: 32
// GPIOC: 64
// GPIOD: 96


exports.pwm = function(){

    var Gpio = require('onoff').Gpio,
        led = new Gpio(78, 'out'),//pin 16 of nanopi s2 is gpioc14.  port c is offest by 64, so gpioc14 is gpio # 78
        button = new Gpio(4, 'in', 'both');

     console.log("writing  0");
        led.writeSync(1);


}