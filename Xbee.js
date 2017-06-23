/**
 * Created by steve on 6/14/2017.
 */
const llib = require("./llibR6");
var state = "start";
var timer;
var data;
var newPanID;
var PANid;
var SIGNALstrength;

// state ss1 - signal strength 1 - waiting for confirmation that xbee is in AT mode

exports.xbeeReceivedData = function(returnedData){

    clearTimeout(timer); //clear the timer as we have data
    console.log('Timer Cleared:'+timer)
    switch (state.substr(0,2)){
        case "ss":
            exports.xbeeGetsignalStrength(state, returnedData);
            break;
        case "gi":
            exports.xbeeGetPanID(state, returnedData);
            break;
        case "si":
            exports.xbeeSetPanID(state, returnedData, newPanID);
            break;
    }

}

exports.xbeeGetsignalStrength = function(st,data,cb){
    if (cb){
        global.xbeeSignalCallBack = cb;
    }
    switch(st){
        case 666:
            console.log("ERROR from XBEE SS");
            if (global.xbeeSignalCallBack){
                global.xbeeSignalCallBack('ERROR from XBEE SS');
            }

            break;
        case 0:
            console.log('Entering AT mode')
            setTimeout(function(){
                sendXbeeData("ss1","+++");
            }, 1000);


            break;
        case "ss1":
            if(data == "OK"){
                console.log('got OK')

                sendXbeeData("ss2","ATDB\r");
            }
            else{
                console.log('expecting ok - got '+data)
                exports.xbeeGetsignalStrength(666,"error"); //if we don't get ok then something is wrong
            }
            break;

        case "ss2"://this data is the signal strength
            SIGNALstrength = data;
            sendXbeeData("ss3","ATCN\r");//clear AT mode
            break;
        case "ss3":
            console.log("The Signal Strength is: " + SIGNALstrength);
            if (global.xbeeSignalCallBack){
                global.xbeeSignalCallBack(SIGNALstrength);
            }

            break;
    }


}

exports.xbeeGetPanID = function(st,data,cb){
    if (cb){
        global.xbeePanCallBack = cb;
    }
    switch(st){
        case 666:
            console.log("ERROR from XBEE GI");
            if (global.xbeePanCallBack){
                global.xbeePanCallBack('ERROR from XBEE GI');
            }


            return("Error");
            break;
        case 0:
            setTimeout(function(){
                sendXbeeData("gi1","+++");
            }, 1000);
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
            PANid = data;
            sendXbeeData("gi3","ATCN\r");//clear AT mode
            break;
        case "gi3":
            console.log("The Pan ID is: " + PANid);
            if (global.xbeePanCallBack) {
                global.xbeePanCallBack(PANid);
            }

            break;
    }

}

exports.xbeeSetPanID = function(st,data,id){
    newPanID = id;
    switch(st){
        case 666:
            console.log("ERROR from XBEE SI");
            break;
        case 0:
            sendXbeeData("si1","+++");
            break;
        case "si1":
            if(data == "OK"){
                sendXbeeData("si2","ATID" + newPanID + "\r"); // send out the new pan id
                console.log(" at si2 getting ready to send data: " +newPanID);
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
    timer =setTimeout(timedout, 1000);
}


function timedout(){ // we are here because the timer timed out - must be an error
    var s = state.substr(0,2);
    switch (s){
        case "ss":
            exports.xbeeGetsignalStrength(666);
            break;
        case "gi":
            exports.xbeeGetPanID(666);
            break;
        case "si":
            exports.xbeeSetPanID(666);
            break;
    }
}
