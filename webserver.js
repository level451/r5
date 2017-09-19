//var debug =  (log.webserver) ? 1:0;
var debug = true;
var console = {}
console.log = (function () {return function (x) {if (debug) {process.stdout.write(ll.ansitime('cyan','Webserver ') + x + '\n');}}})();

/**
 * Created by todd on 3/1/2016.
 */
var express = require('express');
var request = require('request');

var  app = express();
var ejs = require('ejs');
//var bodyParser = require('body-parser');

app.use(express.static('public')); // set up the public directory as web accessible
//app.use(bodyParser.json()); // lets us get the json body out

app.use(function(err, req, res, next) {
    console.log(err.stack);
    res.send(500, 'Something broke!');
});

app.get('/', function (req, res) {
    //   res.render('test.ejs', { title: 'LED' });
    if (!global.settings.failedtoload) {
        res.render('r6.ejs', {wiz: global.wiz, settings: global.settings, wsport: settings.webSocket.listenPort});
    } else
    {
        if(os.type() == "Windows_NT"){
            require('dns').lookup(require('os').hostname(), function (err, add, fam) {

                settings.ipAddress = add;
                res.render('selectSettings.ejs', {wiz: global.wiz, settings: global.settings, wsport: settings.webSocket.listenPort});
                //console.log(JSON.stringify(require('os').networkInterfaces(),null,4))

            });
        }else
        {
            settings.ipAddress = require('os').networkInterfaces().wlan0[0].address
            res.render('selectSettings.ejs', {wiz: global.wiz, settings: global.settings, wsport: settings.webSocket.listenPort});
        }

    }
    });
app.get('/usb', function (req, res) {
    //   res.render('test.ejs', { title: 'LED' });

        if(os.type() == "Windows_NT"){
            require('dns').lookup(require('os').hostname(), function (err, add, fam) {

                settings.ipAddress = add;
                res.render('usb.ejs', {wiz: global.wiz, settings: global.settings, wsport: settings.webSocket.listenPort});

            });
        }else
        {
            settings.ipAddress = require('os').networkInterfaces().wlan0[0].address
            res.render('usb.ejs', {wiz: global.wiz, settings: global.settings, wsport: settings.webSocket.listenPort});
        }


});
app.get('/cue', function (req, res) {
    //   res.render('test.ejs', { title: 'LED' });
    res.render('cue.ejs', {wiz:global.wiz,settings:global.settings,wsport:settings.webSocket.listenPort });
});
app.get('/updateunit', function (req, res) {
    //   res.render('test.ejs', { title: 'LED' });
    res.render('updateunit.ejs', {wiz:global.wiz,settings:global.settings,wsport:settings.webSocket.listenPort });
});

app.use(function(req, res, next) {
    res.status(404).send('Sorry cant find that!');
});

var server = app.listen(settings.webServer.listenPort, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log(ll.ansi('brightBlue','Webserver listening at http://localhost:'+settings.webServer.listenPort));
});



exports.formatDate =  function(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    //  return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
    return strTime;
}


