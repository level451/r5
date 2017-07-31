var pagename ='updateunit';
o = null;
function load() {
    websockstart();
    var selectfiles=document.getElementById('selectfiles')
    selectfiles.addEventListener("change", fileSelectHandler, false);
    var elem = document.getElementById("myBar");
    elem.innerHTML = "PROGRESS_BAR";
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
                    case "updateStatusNLF":
                        updateStatusNLF(x.text);
                        break;
                    case  "pageupdate":
                        document.getElementById("body").innerHTML = x.data.html
                        console.log('HTML BODY UPDATE')
                        break;
                    case "getFile":
                        getFile(x.file)
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
function websocketsend(type,data){

    var sendobj = {};
    sendobj.type = type;
    sendobj.data = data;
    ws.send(JSON.stringify(sendobj));

}
function upload(){
   if(o){

       websocketsend('uploadfiles',o);
       updateStatus('requesting upload...')

   }  else
   {
       updateStatus('select files first')
   }
}
function fileSelectHandler(e) {
    document.getElementById('status').value = ''
    var counter = 0;
    console.log(e)
    // fetch FileList object
    files = e.target.files // || e.dataTransfer.files;
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
        console.log(files[k].name)
        console.log(JSON.stringify(showWiz,null,4));
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
        updateStatus('wiz.dat not found - aborting')

    }

    return

    //console.log(e.target.files)
    // process all File objects



}
function updateStatus(x){
    var status = document.getElementById('status');
    status.value=x+'\n'+status.value;
    if (status.value.length > 3000){
        console.log('trimmed')
        status.value = status.value.substring(0,2000);
    }
}
function updateStatusNLF(x){
    var status = document.getElementById('status');
    status.value=x+status.value;

}
function getFile(file){
    console.log('get file:'+file.name)
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
        move();
        // counter++
        //
        // if (counter < files.length) {
        //     reader.readAsDataURL(files[counter]);
        // }

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

function move() {
    var elem = document.getElementById("myBar");

    var width = elem.length/files.length;
    width += elem.length/files.length;
    elem.style.width = width + '%';
    elem.innerHTML = "PROGRESS BAR";
}

