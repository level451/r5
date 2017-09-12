/**
 * Created by todd on 9/12/2017.
 */

require('child_process').exec("xdpyinfo  | grep 'dimensions:'", function (err, resp) {
    resp = resp.toString()
    var resolution = resp.substring(resp.charAt(':'),resp.charAt('p')).trim()
    console.log(resp)
    console.log(resolution)
    console.log(resp.charAt(':'))
    console.log(resp.charAt('p'))
    console.log(err)


});