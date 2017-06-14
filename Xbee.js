/**
 * Created by steve on 6/14/2017.
 */
const llib = reguire("./llibR6");
var state;
var timer;   setTimeout(timedout, 1000);
var data;
// state ss1 - signal strength 1 - waiting for confirmation that xbee is in AT mode

exports.xbeeReceivedData = function(returnedData){
    clearTimeout(timer); //clear the timer as we have data
    switch (state.substr(0,2)){
        case "ss":
            exports.xbeeGetsignalStrength(state, returnedData);
            break;
        case "gi":
            exports.xbeeGetPanID(state, returnedData);
            break;
        case "si":
            exports.xbeeSetPanID(state, returnedData);
            break;
    }


}

exports.xbeeGetsignalStrength = function(st,data){

    switch(st){
        case 666:
            console.log("ERROR from XBEE SS");
            break;
        case 0:
            sendXbeeData("ss1","+++");
            break;
        case "ss1":
            if(data = "OK"){
              sendXbeeData("ss2","ATDB\r");
            }
            else{
                exports.xbeeGetsignalStrength(666,"error"); //if we dont get ok then something is wrong
            }
            break;

        case "ss2"://this data is the signal strength
            console.log("The Signal Strength is: " + data);
            sendXbeeData("ss3","ATCN\r");//clear AT mode
            break;

    }


}

exports.xbeeGetPanID = function(st,data){
    switch(st){
        case 666:
            console.log("ERROR from XBEE GI");
            break;
        case 0:
            sendXbeeData("gi1","+++");
            break;
        case "gi1":
            if(data == "OK"){
                sendXbeeData("gi2","ATID\r");
            }
            else{
                exports.xbeeGetsignalStrength(666,"error"); //if we dont get ok then something is wrong
            }
            break;

        case "gi2"://this data is the pan ID
            console.log("The Pan ID is: " + data);
            sendXbeeData("gi3","ATCN\r");//clear AT mode
            break;


    }

}

exports.xbeeSetPanID = function(st,data,id){
    switch(st){
        case 666:
            console.log("ERROR from XBEE SI");
            break;
        case 0:
            sendXbeeData("si1","+++");
            break;
        case "si1":
            if(data == "OK"){
                sendXbeeData("si2","ATID" + id + "\r"); // send out the new pan id
            }
            else{
                exports.xbeeGetsignalStrength(666,"error"); //if we dont get ok then something is wrong
            }
            break;

        case "si2"://this data is confirmation of pan id
            if(data == "OK") {
                sendXbeeData("si3", "ATAC\r");//Apply changes
            }
            else{
                exports.xbeeSetPanID(666,"error"); //if we dont get ok then something is wrong
            }
            break;
        case "si3"://this data is confirmation of pan id
            if(data == "OK") {
                sendXbeeData("si4", "ATWR\r"); //Make changes permanent
            }
            else{
                exports.xbeeSetPanID(666,"error"); //if we dont get ok then something is wrong
            }
            break;
        case "si4"://this data is confirmation of pan id
            if(data == "OK") {
                sendXbeeData("si5", "ATCN\r"); //exit AT mode
            }
            else{
                exports.xbeeSetPanID(666,"error"); //if we dont get ok then something is wrong
            }
            break;



    }


}


function sendXbeeData(st, data){
    state = st;
    llib.serialWrite(data);
    setTimeout(timedout, 1000);
}


function timedout(){ // we are here because the timer timed out - must be an error
    switch (state.substr(0,2)){
        case ss:
            exports.xbeeGetsignalStrength(666);
            break;
        case gi:
            exports.xbeeGetPanID(666);
            break;
        case si:
            exports.xbeeSetPanID(666);
            break;
    }
}
function setTimedout(){
    timer = setTimeout(timedout,1000);
}