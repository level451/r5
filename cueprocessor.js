/**
 * Created by todd on 5/2/2017.
 */
var debug = true;
var console = {}

console.log = (function () {return function (x) {if (debug) {process.stdout.write(ll.ansitime('green','Cue           ') + x + '\n');}}})();


exports.incommingCue = function(c){
    //temp line for testing - remove when cue sended is fixed
//c= wiz.ShowName+' '+'GO '+c
//console.log('At cue processor')

    if (global.lastCueReceived == c ){

    console.log('Duplicate cue - ignoring')
    return

}
    global.lastCueReceived = c; //log the last cue received
if (global.testMode){
    ws.send(JSON.stringify({object: 'testModeData', data: c}), 'r6'); // send the raw cue data
    xbee.xbeeGetsignalStrength(0,0,function(signalStrength){
        ws.send(JSON.stringify({object: 'testModeSignal', data: signalStrength}), 'r6'); // send the raw cue data


    })
}
else {


    c = c.match(/\S+/g); // breaks string into array at the spaces so s[0] is showname etc.
    // verify the showname is the correct showname
    // added c && c[0] && 8/28/17 - in case we get testing garbage - shouldn't crash now
    settings.performance.cueCounter.total ++;
    if (c != null && c[0] != null && c[0].toUpperCase() != wiz.ShowName.toUpperCase()) {
        process.stdout.write(ll.ansitime('red', 'Cue           Showname error RECIEVED:' + c[0] + ' EXPECTED:' + wiz.ShowName) + '\n'); // show error
        return;
    }
    settings.performance.cueCounter.show ++;
    switch (c[1]) {
        case 'GO':
            // need to verify fire exists and check for text override
            switch (c[2].split('.').pop()) // c[2] contains the filename - the switch is on thje filename extension

            {
                case 'jpg':
                    settings.performance.cueCounter.jpg ++;
                    console.log('Received Filename:' + c[2])
                    //c[2]=c[2].substring(0,1).toUpperCase()+c[2].substring(1).toLowerCase()
                    c[2] = c[2].toLowerCase()
                    console.log('Modified Filename:' + c[2])
                    ws.send(JSON.stringify({object: 'cue', type: 'slide', data: c[2]}), 'r6'); // send the cue data to all the 'r6' webpages
                    break;
                case 'mp3':
                    settings.performance.cueCounter.mp3 ++;
                    console.log('Received Filename:' + c[2])
                    c[2] = c[2].substring(0, c[2].indexOf('.')).toUpperCase() + c[2].substring(c[2].indexOf('.')).toLowerCase()
                    console.log('Modified Filename:' + c[2])

                    ws.send(JSON.stringify({object: 'cue', type: 'audio', data: c[2]}), 'r6'); // send the cue data to all the 'r6' webpages
                    break;
                case 'mp4':
                    settings.performance.cueCounter.mp4 ++;
                    console.log('Received Filename:' + c[2])
                    //c[2]=c[2].substring(0,1).toUpperCase()+c[2].substring(1).toLowerCase()
                    c[2] = c[2].toLowerCase()
                    console.log('Modified Filename:' + c[2])

                    ws.send(JSON.stringify({object: 'cue', type: 'video', data: c[2]}), 'r6'); // send the cue data to all the 'r6' webpages
                    break;

                default:
                    settings.performance.cueCounter.unhandled ++;
                    process.stdout.write(ll.ansitime('red', 'Cue           Unhandled file extension:' + c[2].split('.').pop()) + '\n'); // show error
                    break;
            }

            break;
        default:
            settings.performance.cueCounter.noGO ++;
            process.stdout.write(ll.ansitime('red', 'Cue           Command not known:' + c[1]) + '\n'); // show error
            return
            break;


    }

    console.log('parsed que data:' + c)
}
}
