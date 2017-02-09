var debug =  (log.webserver) ? 1:0;
var console = {}
console.log = (function () {return function (x) {if (debug) {process.stdout.write(ll.ansitime('cyan','Webserver ') + x + '\n');}}})();

/**
 * Created by todd on 3/1/2016.
 */
var express = require('express');
var request = require('request');

var  app = express();
var ejs = require('ejs');
//var x =ejs.render('<%= new Date()%>')
//console.log(x)
var bodyParser = require('body-parser');

app.use(express.static('public')); // set up the public directory as web accessible
app.use(bodyParser.json()); // lets us get the json body out

app.use(function(err, req, res, next) {
    console.log(err.stack);
    res.send(500, 'Something broke!');
});

app.get('/', function (req, res) {
    //   res.render('test.ejs', { title: 'LED' });
    res.render('lights.ejs', { title: 'LED' });
});
app.get('/main', function (req, res) {
    res.render('main.ejs',{options:global.settings.options,things:global.things,wsport:settings.options.websocket.listenport});
});
app.get('/test', function (req, res) {
    res.render('test.ejs');
});
app.get('/cam/frontdoor',function(req,res){

    var request_options = {
        auth: {
            user: 'todd',
            pass: 'cheese'},
        url: 'http://10.6.1.6/mjpg/video.mjpg',
    };

    var req_pipe = request(request_options);
    req_pipe.pipe(res);

    req_pipe.on('error', function(e){
        console.log(e)
    });
    //client quit normally
    req.on('end', function(){
        console.log('end');
        req_pipe.abort();

    });
    //client quit unexpectedly
    req.on('close', function(){
        console.log('close - liveview');
        req_pipe.abort()

    })


})
app.get('/snap.jpg',function(req,res){
    res.send(new Buffer(axis.snap(),'binary'))
})
app.get('/things', function (req, res) {
    res.render('things.ejs',{things:global.things,wsport:settings.options.websocket.listenport});
});
app.get('/rules', function (req, res) {
    res.render('rules.ejs',{things:global.things,wsport:settings.options.websocket.listenport});
});
app.get('/witzy', function (req, res) {
    res.render('witzy.ejs',{options:global.settings.options,things:global.things,wsport:settings.options.websocket.listenport});
});
app.get('/sttest', function (req, res) {
    res.render('sttest.ejs',{options:global.settings.options,things:global.things,wsport:settings.options.websocket.listenport});
});
app.get('/smartthingsoauth', function (req, res) {
    res.render('smartthingsoauth.ejs',{options:global.settings.options,wsport:settings.options.websocket.listenport});
});
app.get('/shower', function (req, res) {

    db.collection('waterheater').find({isshower: true}).sort({"ontime": -1}).limit(100).toArray(function(err,rslt){
        //console.log(rslt[0]);
        //console.log(s);
        res.render('waterheater.ejs', { title: 'LED',s:rslt });


    });

});

app.get('/cam', function (req, res) {
    var x = new Date();
    //console.log(webserver.formatDate(x))
    //    db.collection('log').find({ $and:[{"sd": {"$gte": new Date(x.getFullYear(),x.getMonth(),x.getDate()), "$lt": x}},
    db.collection('log').find({ $and:[{"ontime": {"$gte": new Date(x.getFullYear(),x.getMonth(),x.getDate()-1)}},
        {id:"axisfrontdoorcam"}]})
        .sort({"ontime": -1}).toArray(function(err,rslt){
        //  console.log(err,rslt[0]);
        res.render('cam.ejs', { title: 'LED',events:rslt });


    });

});

app.get('/harmony', function (req, res) {
    res.render('harmony.ejs',{options:global.settings.options,wsport:settings.options.websocket.listenport});


});

app.post('/cam/upload',bodyParser.raw({ limit: '50mb',type: 'image/jpeg' }), function(req, res){
    //console.log(req.headers) // form fields
    axis.incomingaxisjpg(req);

    res.status(204).end()
});

app.post('/api/witzy', function (req, res) {

    if(settings.options.modules.witzy){
        witzy.api(req.body);
    }


    res.status(200).end();

});
app.post('/sonos', function (req, res) {
    if(settings.options.modules.sonos){
        sonos.api(req.body);

    }
    res.status(200).end();
})
app.use(function(req, res, next) {
    res.status(404).send('Sorry cant find that!');
});

var server = app.listen(settings.options.webserver.listenport, function () {
    var host = server.address().address;
    var port = server.address().port;
    //console.log('Http server listening at http://%s:%s', host, port);
    console.log(ll.ansi('brightBlue','Webserver listening at http://'+settings.info.externalipaddress+':'+settings.options.webserver.listenport));
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


exports.executecommand = function(obj,cmd,value,delay) {
    switch(cmd.command){
        case "writediv":
            console.log(value.html)

            websock.send(JSON.stringify({object:"pageupdate",data:{html:ejs.render(value.html)}}),'main');
            break;
        case "writedivfile":
            console.log(value);
            ejs.renderFile('./views/'+value, function(err, str){
                // str => Rendered HTML string
                console.log(str)
                websock.send(JSON.stringify({object:"pageupdate",data:{html:str}}),'main');

            });
            break;
        case "displaycamera":
            if (!value.date){value.date = new Date()}else
            {value.date = new Date(value.date)}

            console.log(value.date)
            //console.log(webserver.formatDate(x))
            //    db.collection('log').find({ $and:[{"sd": {"$gte": new Date(x.getFullYear(),x.getMonth(),x.getDate()), "$lt": x}},
            db.collection('log').find({ $and:[{"ontime": {"$gte": new Date(value.date.getFullYear(),value.date.getMonth(),value.date.getDate())}},
                {"ontime": {"$lte": new Date(value.date.getFullYear(),value.date.getMonth(),value.date.getDate()+1)}},
                {id:value.cameraid},{closed:true}]}).sort({"ontime": -1}).limit(6).toArray(function(err,camEvents){
                websock.send(JSON.stringify({object:"displaycam",data:{camEvents:camEvents,o:ll.getthingbyid(value.cameraid)}}),'main');
            });


            break;
        case "displaytemperature":
            if (!value.enddate)
            {value.enddate = new Date()}else
            {value.enddate = new Date(value.enddate)}
            if (!value.startdate)
            {value.startdate = new Date(value.enddate-(86400000/2))}else // 24 hours
            {value.startdate = new Date(value.startdate)}


            db.collection('events').find({ $and:[{id:value.sensorid},{"time": {"$gte": value.startdate}},
                {"time": {"$lte": value.enddate}},{event:"temperature"}]},{time:true,val:true}).sort({"time": 1}).toArray(function(err,tempEvents){
                var o = ll.getthingbyid(value.sensorid)
                o.startdate = value.startdate;
                o.enddate = value.enddate;
                // get run info from the thermostat
                // hard coded id - this wont work for anyone but Todd

                db.collection('events').find({ $and:[{id:"b0481658-0f20-4c12-96de-5c4c3f76d1db"},{"time": {"$gte": value.startdate}},
                    {"time": {"$lte": value.enddate}},{event:"thermostatStatus"}]},{time:true,val:true}).sort({"time": 1}).toArray(function(err,hvacEvents) {
                    websock.send(JSON.stringify({object:"displaytemperature",data:{hvacEvents:hvacEvents,tempEvents:tempEvents,o:o}}),'main');

                });



            });


            break;

    }






}
