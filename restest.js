/**
 * Created by todd on 9/12/2017.
 */

require('child_process').exec("DISPLAY=:0 xdpyinfo  | grep 'dimensions:'", function (err, resp) {
    resp = resp.toString()
    var resolution = resp.substring(resp.indexOf(':'),resp.indexOf('p')).trim()
    console.log(resp)
    console.log(resolution)
    console.log(resp.indexOf(':'))
    console.log(resp.indexOf('p'))
    console.log(err)


});