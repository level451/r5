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
 //console.log(e.target.files)
    // process all File objects
    var reader = new FileReader();
    reader.onload = function(e) {
        // This goes here:
        sha(e.target.result,function(hash){

            console.log(files[counter].webkitRelativePath,new Uint8Array(hash),counter);

            files[counter].sha=new Uint8Array(hash);
            counter++

            if (counter < files.length){

                reader.readAsArrayBuffer(files[counter]);

            }

        })
       };



        reader.readAsArrayBuffer(files[counter]);


}
function sha(file,cb){
    window.crypto.subtle.digest(
        {
            name: "SHA-256",
        },
       file //The data you want to hash as an ArrayBuffer
    )
        .then(function(hash){
            //returns the hash as an ArrayBuffer

            if(cb){
                cb(hash)
            }
        })
        .catch(function(err){
            console.error(err);
        });


}