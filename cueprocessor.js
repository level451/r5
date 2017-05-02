/**
 * Created by todd on 5/2/2017.
 */
var debug = true;
var console = {}
console.log = (function () {return function (x) {if (debug) {process.stdout.write(ll.ansitime('green','Cue           ') + x + '\n');}}})();


exports.incommingCue = function(c){
    //temp line for testing - remove when cue sended is fixed
//c= wiz.ShowName+' '+'GO '+c

    c = c.match(/\S+/g); // breaks string into array at the spaces so s[0] is showname etc.
    // verify the showname is the correct showname
    if (c[0].toUpperCase() != wiz.ShowName.toUpperCase()){
        process.stdout.write(ll.ansitime('red','Cue           Showname error RECIEVED:'+c[0]+' EXPECTED:'+wiz.ShowName)+'\n'); // show error
        return;
    }

    switch (c[1])
    {
        case 'GO':
            // need to verify fire exists and check for text override

            ws.send(JSON.stringify({object:'cue',data:c[2]}),'r6'); // send the cue data to all the 'r6' webpages
            break;
        default:
            process.stdout.write(ll.ansitime('red','Cue           Command not known:'+c[1])+'\n'); // show error
            return
            break;



    }

    console.log(c)

}
