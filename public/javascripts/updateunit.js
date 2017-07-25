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
    console.log('here')


    // fetch FileList object
    var files = e.target.files || e.dataTransfer.files;
 console.log(e.target.files)
    // process all File objects
    var reader = new FileReader();
    reader.onload = function(e) {
        var contents = e.target.result;
        // This goes here:
        window.crypto.subtle.digest(
            {
                name: "SHA-256",
            },
            contents //The data you want to hash as an ArrayBuffer
        )
            .then(function(hash){
                //returns the hash as an ArrayBuffer
                console.log(new Uint8Array(hash));
            })
            .catch(function(err){
                console.error(err);
            });
    };
    // for (var i = 0, f; f = files[i]; i++) {
        f = files[0]

         console.log(f.name)
    reader.readAsArrayBuffer(f);
         //ParseFile(f);
    // }

}