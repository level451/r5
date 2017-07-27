var pagename ='updateunit';

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

                    case  "pageupdate":
                        document.getElementById("body").innerHTML = x.data.html
                        console.log('HTML BODY UPDATE')
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
function fileSelectHandler(e) {
    var counter = 0;
    console.log(e)
    // fetch FileList object
    files = e.target.files // || e.dataTransfer.files;
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
            console.log('Wiz.dat found in the wrong location - aborting:')
            console.log('Expecting:'+showWiz.ShowName + '/wiz.dat have:'+files[k].webkitRelativePath)
            return;

        }
        var o = {} // create the comparison object
        o.show = showWiz.ShowName;
        o.version = showWiz.Version;

        for (var i=0;i<files.length;++i) {
            o[files[i].webkitRelativePath] = {}
            o[files[i].webkitRelativePath].name = files[i].name;
            o[files[i].webkitRelativePath].size = files[i].size;
            o[files[i].webkitRelativePath].lastModified = files[i].lastModified;
        }
            // got the file comparision object -
        console.log(JSON.stringify(o,null,4))

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
        console.log('found wiz.dat')

        wizReader.readAsText(files[k]);
    } else {

        console.log('wiz .dat not found - aborting')
    }

    return

    //console.log(e.target.files)
    // process all File objects
    var reader = new FileReader();
    reader.onload = function() {
        // This goes here:
     //   files[counter].data = e.target.result;

        console.log(files[counter].webkitRelativePath,files[counter], counter);
        websocketsend('file',
            {
                filename:files[counter].name,
                lastModified:files[counter].lastModified,
                size:files[counter].size,
                data:reader.result.substring(reader.result.indexOf(',')+1),
                relativePath:files[counter].webkitRelativePath
            })
        // counter++
        //
        // if (counter < files.length) {
        //     reader.readAsDataURL(files[counter]);
        // }

    }




        reader.readAsDataURL(files[counter]);


}
