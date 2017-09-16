/**
 * Created by todd on 9/12/2017.
 */

// var monitor = require('node-usb-detection');
//
//
// //console.log("Usb Devices:\n", monitor.list());
//
// monitor.add(function(device) {
//     console.log("added device:\n", device);
// });
//
// monitor.remove(function(device) {
//     console.log("removed device:\n", device);
// });

//monitor.change(function(device) {
//    console.log("device changed:\n", device);
//});


//require('child_process').exec("xdpyinfo  | grep 'dimensions:'", function (err, resp) {
 //   var resolution = resp.substring(resp.indexOf(':')+1,resp.indexOf('p')).trim()
// nano pi "480x800"

//});
const fs = require('fs');

var usbDetect = require('usb-detection');

// Detect add/insert
usbDetect.on('add', function(device) {
    console.log('add', device);
    fs.exists('/media/usb0/show', function(exists) {
        console.log("folder exists ? " + exists);
});
//usbDetect.on('add:vid', function(device) { console.log('add', device); });
//usbDetect.on('add:vid:pid', function(device) { console.log('add', device); });

// Detect remove
usbDetect.on('remove', function(device) {
    console.log('remove', device);

});
//usbDetect.on('remove:vid', function(device) { console.log('remove', device); });
//usbDetect.on('remove:vid:pid', function(device) { console.log('remove', device); });