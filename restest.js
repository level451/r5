/**
 * Created by todd on 9/12/2017.
 */

var monitor = require('node-usb-detection');


//console.log("Usb Devices:\n", monitor.list());

monitor.add(function(device) {
    console.log("added device:\n", device);
});

monitor.remove(function(device) {
    console.log("removed device:\n", device);
});

//monitor.change(function(device) {
//    console.log("device changed:\n", device);
//});


//require('child_process').exec("xdpyinfo  | grep 'dimensions:'", function (err, resp) {
 //   var resolution = resp.substring(resp.indexOf(':')+1,resp.indexOf('p')).trim()
// nano pi "480x800"

//});