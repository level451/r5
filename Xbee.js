/**
 * Created by steve on 6/14/2017.
 */
const llib = reguire("./llibR6");
var state = 0;
var timer;   setTimeout(timedout, 1000);
var noresponse = 0;
var data;
// state ss1 - signal strength 1 - waiting for confirmation that xbee is in AT mode

exports.xbeeReceivedData = function(returnedData){
    clearTimeout(timer); //clear the timer as we have data
    switch (state){




    }


}

exports.xbeeGetsignalStrength = function(st){

    switch(st){
        case 666:
            console.log("ERROR from XBEE SS");
            break;
        case 0:
            sendXbeeData(ss1,"+++");
            break;
        case "ss1":
            if(data = "OK"){
              sendXbeeData(ss2,"ATID\r");
            }

    }


}

exports.xbeeGetPanID = function(st){


}

exports.xbeeSetPanID = function(st, id){



}


function sendXbeeData(st, data){
    state = st;
    llib.serialWrite(data);
    setTimeout(timedout, 1000);
}

function exitATMode(){


}

function timedout(){
    noresponse = 1; // the 1 second timer has timed out send error back;
    switch (state.substring(0,2)){
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
    noresponse = 0;// clear the variable
    timer = setTimeout(timedout,1000);
}