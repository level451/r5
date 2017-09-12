/**
 * Created by todd on 9/12/2017.
 */

require('child_process').exec("xdpyinfo  | grep 'dimensions:'", function (err, resp) {
    var resolution = resp.substring(resp.indexOf(':')+1,resp.indexOf('p')).trim()
// nano pi "480x800"

});