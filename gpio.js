/**
 * Created by steve on 4/26/2017.
 */
if(os.type() != 'Windows_NT') {
    var Gpio = require('onoff').Gpio;
}



exports.pwm = function(){

    led = new Gpio(27, 'out');         // Export GPIO #14 as an output.

// Toggle the state of the LED on GPIO #14 every 200ms 'count' times.
// Here asynchronous methods are used. Synchronous methods are also available.
    (function blink(count) {
        if (count <= 0) {
            return led.unexport();
        }

        led.read(function (err, value) { // Asynchronous read.
            if (err) {
                throw err;
            }

            led.write(value ^ 1, function (err) { // Asynchronous write.
                if (err) {
                    throw err;
                }
            });
        });

        setTimeout(function () {
            blink(count - 1);
        }, 200);
    }(25));

}