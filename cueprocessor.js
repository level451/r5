/**
 * Created by todd on 5/2/2017.
 */
var debug = true;
var console = {}
console.log = (function () {return function (x) {if (debug) {process.stdout.write(ll.ansitime('green','Cue: ') + x + '\n');}}})();


exports.incommingCue = function(c){
console.log(c)

}
