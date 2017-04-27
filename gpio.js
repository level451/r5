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
//   13          62
//   15          63
//   16          78
//   18          59
//   26          58
//   29          72
//   31          71
//   32          92
//   33          77





exports.pwm = function(){

    var Gpio = require('onoff').Gpio,
        led = new Gpio(59, 'out'),
        button = new Gpio(78, 'in', 'both');


    button.watch(function (err, value) {
        if (err) {
            throw err;
        }
        console.log("writing "+ value)
        led.writeSync(value);
    });

}