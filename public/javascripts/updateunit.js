var pagename ='updateunit';
o = null;
var masterData;
function load() {
    websockstart();
    var selectfiles=document.getElementById('selectfiles')
    selectfiles.addEventListener("change", fileSelectHandler, false);


}
function websockstart(){
    ws = new ReconnectingWebSocket(wsUri);
    ws.onopen = function(evt){
        console.log("websocket connected");
        websocketsend('setwebpage',{pagename:pagename});

    };
    ws.onmessage = function(evt) {
        switch (typeof(evt.data)){
            case 'string':
                var x = JSON.parse(evt.data);
                switch(x.object){
                    case "things":
                        break;
                    case "updateStatus":
                        updateStatus(x.text);
                        break;
                    case "updateFileTransfer":
                        document.getElementById("updateFileTransfer").innerHTML = x.text;
                        break;

                    // case "updateStatusNLF":
                    //     updateStatusNLF(x.text);
                    //     break;
                    case  "pageupdate":
                        document.getElementById("body").innerHTML = x.data.html
                        console.log('HTML BODY UPDATE')
                        break;
                    case "getFile":
                        getFile(x.file)

                        break;
                    case "showUpToDate":
                        document.getElementById('droptext').innerHTML="The Show Version is Current - Select Another Show"
                        document.getElementById("upload").style.display = "none"

                        break;
                    case "okToUpload":

                        // enable the upload button here
                        uploadProgress=document.getElementById("uploadProgress");
                        uploadProgress.max = x.bytesToTransfer
                        document.getElementById("upload").style.display = "block"
                        document.getElementById('droptext').innerHTML="Press Upload to Transfer Show"
                        break;
                    case "uploadComplete":
                       console.log('at update complete')
                        document.getElementById("upload").style.display = "none"
                        document.getElementById("updateFileTransfer").innerHTML = ''; // clear the info div
                        document.getElementById('droptext').innerHTML="Upload Complete - Choose Next Show"
                        break;
                    case "statusBeacon":
                        console.log(JSON.stringify(x.data,null,4))
                        var newBeacon = createBeaconElement(x.data.MACAddress);

                        // add the status beacon elements if they are not there
                        if (x.data.masterunit){
                        masterData = x.data;
                            if (!document.getElementById(x.data.MACAddress)){
                                document.getElementById('masterStatusBeacon').appendChild(newBeacon);

                            }

                        } else {
                            if (!document.getElementById(x.data.MACAddress)){
                                document.getElementById('statusBeacons').appendChild(newBeacon);
                            }
                        }

                        //console.log(x.data.MACAddress)
                       // document.getElementById(x.data.MACAddress).value = JSON.stringify(x.data,null,4)
                        var beEl = document.getElementById(x.data.MACAddress)
                        drawBeaconElement(beEl.getContext("2d"),x.data);
                        // if we dont get a beacon soon enough show the comm is lost
                        clearTimeout(beEl.timeout);
                        beEl.timeout = setTimeout(function(){
                            var ctx = beEl.getContext("2d")
                            ctx.lineWidth =1;
                            ctx.strokeStyle = 'red';
                            ctx.font = "30px Arial";
                            ctx.strokeText("Comm Timeout",0,30);

                        },6000)
                        break;
                    case "transferStatus":
                        console.log(JSON.stringify(x.status));
                        break;
                    default:
                        console.log(x.object);
                    //  alert(x.object);
                }
                break;
            case 'object':
                console.log(JSON.stringify(evt,null,4))
        }


    };

}
const beaconWidth = 210
const beaconHeight = 300

function createBeaconElement(mac){

    var newBeacon = document.createElement('canvas')
    newBeacon.id = mac;
    newBeacon.width = beaconWidth;
    newBeacon.height = beaconHeight;
    newBeacon.style="border:1px solid #000000;"
    // var newBeacon = document.createElement('textarea')
    // newBeacon.rows = 14;
    // newBeacon.cols = 30;
    return newBeacon

}
function drawBeaconElement(ctx,d){
    //console.log('draw')
    ctx.clearRect(0, 0, beaconWidth , beaconHeight);
    ctx.fillStyle = 'black';
    ctx.font = "14px Arial";
    ctx.fillText('Unit ID:'+d.MACAddress.substring(9),5,15);
    if (d.masterunit){
        ctx.fillStyle = 'blue';
        ctx.fillText('Master Unit',125,15);
    }
    ctx.beginPath();
    ctx.lineWidth =3;
    ctx.strokeStyle = 'black';

    ctx.moveTo(0,20);
    ctx.lineTo(beaconWidth,20);
    ctx.stroke();
    drawGauge(ctx,35,70,d.Battery,'Battery',0,20,20,30,30,100)
    drawGauge(ctx,105,70,d.freeSpace,'Space',0,10,10,20,20,100)
    drawGauge(ctx,175,70,d.Temperature,'Temperature',85,100,80,85,0,80)

}
function drawGauge(ctx,x,y,value,title,redstart,redstop,yellowstart,yellowstop,greenstart,greenstop){

    if (value == undefined){value = 0}
    var rad = 25;
    ctx.fillStyle = 'black';
    ctx.font = "bold 12px Arial";
    ctx.fillText(title,x-((ctx.measureText(title).width/2)),y-rad-10);
    ctx.font = "bold 16px Arial";

    ctx.fillText(value,x-((ctx.measureText(value).width/2)),y+5);
    ctx.lineWidth =15;

    // draw red
    ctx.beginPath();
    ctx.strokeStyle = '#ff0000';
    ctx.arc(x, y,rad, drawValue(redstart),drawValue(redstop));
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#ffff00';
    ctx.arc(x, y,rad, drawValue(yellowstart),drawValue(yellowstop));
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = '#00ff00';
    ctx.arc(x, y,rad, drawValue(greenstart),drawValue(greenstop));
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#000000';
    ctx.arc(x,y, rad, drawValue(value), 2.25 * Math.PI);
    ctx.stroke();
    function drawValue(d){
        return ((d/100)*Math.PI*1.5)+Math.PI*.75
    }
}

function websocketsend(type,data){

    var sendobj = {};
    sendobj.type = type;
    sendobj.data = data;
    ws.send(JSON.stringify(sendobj));

}
function upload(){
   if(o){

       websocketsend('uploadfiles',o);
       document.getElementById('droptext').innerHTML="Upload In Progress..."

       updateStatus('requesting upload...')

   }  else
   {
       updateStatus('select files first')
   }
}
function fileSelectHandler(e) {
console.log(e)
    document.getElementById('droptext').innerHTML="Verifying Files"

    document.getElementById('status').value = ''
    var counter = 0;
    // fetch FileList object
   files = e.target.files || e.dataTransfer.files;
    updateStatus('Files Chosen:'+files.length)
    // read the wiz.dat
    var wizReader = new FileReader();
    wizReader.onload = function() {
       // console.log('WIZ:'+wizReader.result)
        showWiz = {}
        var lines = wizReader.result.split('\n');
        for(var line = 0; line < lines.length; line++){
            if (lines[line].indexOf(':') != -1){ // make sure there is a :
                showWiz[lines[line].substr(0,lines[line].indexOf(':'))]=lines[line].substr(lines[line].indexOf(':')+1).trim();

            } else
            {
                console.log('Invalid line colon not found - ignoring:'+line);
            }
        }
        //console.log(files[k].name)
        //console.log(JSON.stringify(showWiz,null,4));
        // verify this wiz.dat is in the right place
        if (files[k].webkitRelativePath  != showWiz.ShowName + '/wiz.dat'){
            updateStatus('Wiz.dat found in the wrong location - aborting:')
            updateStatus('Expecting:'+showWiz.ShowName + '/wiz.dat have:'+files[k].webkitRelativePath)
            return;

        }
        o = {} // create the comparison object - global
        o.show = showWiz.ShowName;
        o.version = showWiz.Version;
        updateStatus('wiz.dat loaded -')
        updateStatus('Show Name:'+o.show);
        updateStatus('Show Version:'+o.version);
        for (var i=0;i<files.length;++i) {
            o[files[i].webkitRelativePath] = {}
            o[files[i].webkitRelativePath].name = files[i].name;
            o[files[i].webkitRelativePath].size = files[i].size;
            o[files[i].webkitRelativePath].lastModified = files[i].lastModified;
        }
            // got the file comparision object -
        updateStatus('Comparing local files to files on unit(remote)');

        websocketsend('comparefiles',o);
        }
    // scan for wiz.dat in the filelist
    var filefound = false;
    for (var k=0;k<files.length;++k){
        if (files[k].name == 'wiz.dat'){
            filefound = true;

            break;
        }

    }
    if (filefound){
        // this calls back to wizReader.onload - convoluted but works
        updateStatus('wiz.dat found - loading...')


        wizReader.readAsText(files[k]);
    } else {
        document.getElementById("upload").style.display = "none"

        updateStatus('wiz.dat not found - aborting')
        updateStatus('Please Select Show Folder')
        document.getElementById('droptext').innerHTML="Drag the Show Folder Here - or click to Browse "

    }

    return

    //console.log(e.target.files)
    // process all File objects



}
function updateStatus(x){
    var status = document.getElementById('status');
    status.value=status.value+x+'\n';
    //    status.value=x+'\n'+status.value;
    // if (status.value.length > 3000){
    //    // console.log('trimmed')
    //     status.value = status.value.substring(0,2000);
    // }
}
// function updateStatusNLF(x){
//     var status = document.getElementById('status');
//     status.value=x+status.value;
//
// }
function getFile(file){
    //console.log('get file:'+file.name)
    var reader = new FileReader();
    reader.onload = function() {

       // console.log(files[k].webkitRelativePath,files[k]);
        websocketsend('file',
            {
                filename:files[k].name,
                lastModified:files[k].lastModified,
                size:files[k].size,
                data:reader.result.substring(reader.result.indexOf(',')+1),
                relativePath:files[k].webkitRelativePath,
                split:file.split,
                start:file.start,
                last:file.last,
                first:file.first
            })
        // counter++
        //
        // if (counter < files.length) {
        //     reader.readAsDataURL(files[counter]);
        // }
        uploadProgress.value += file.size
        //update the progress bar

    }

    var filefound = false;
    for (var k=0;k<files.length;++k){
        if (files[k].webkitRelativePath == file.name){
            filefound = true;

            break;
        }

    }
    if (filefound){
        if (file.split){
            reader.readAsDataURL(files[k].slice(file.start,file.start+file.length));
        } else
        {
            reader.readAsDataURL(files[k]);
        }


    } else {
        console.log('requested file not in the filelist:'+file.name)
    }

}



