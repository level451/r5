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
function transferFile(file,cb){
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