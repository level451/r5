/**
 * Created by todd on 9/12/2017.
 */

require('child_process').exec("xdpyinfo  | grep 'dimensions:'", function (err, resp) {
    var resolution = resp.substring(resp.indexOf(':')+1,resp.indexOf('p')).trim()
    console.log(resp)
    console.log(resolution)
    console.log(resp.indexOf(':'))
    console.log(resp.indexOf('p'))
    console.log(err)


});