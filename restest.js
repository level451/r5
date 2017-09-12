/**
 * Created by todd on 9/12/2017.
 */

require('child_process').exec('xrandr', function (err, resp) {
    console.log(resp)
    console.log(err)

});