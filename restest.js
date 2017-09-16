/**
 * Created by todd on 9/12/2017.
 */


const fs = require('fs');

var usbDetect = require('usb-detection');

// Detect add/insert
usbDetect.on('add', function(device) {
    console.log("USB Inserted");

    timerDirExists = setTimeout(function(){exports.checkFolderExists()},3000 ); // wait for usbstick to be mounted

});
//usbDetect.on('add:vid', function(device) { console.log('add', device); });
//usbDetect.on('add:vid:pid', function(device) { console.log('add', device); });

// Detect remove
usbDetect.on('remove', function(device) {
    console.log("USB Removed");

});


//usbDetect.on('remove:vid', function(device) { console.log('remove', device); });
//usbDetect.on('remove:vid:pid', function(device) { console.log('remove', device); });
exports.checkFolderExists = function(){
    if (fs.existsSync('/media/usb0/show')) {
        console.log("We have a Show Directory -- do something");

    }
    else {
        console.log("USB inserted but no Show Directory");
    }

}