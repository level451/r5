
/**
 * Created by todd on 8/24/2017.
 */
startApp()
function startApp()
{
    child = require('child_process').spawn('node', ['start.js']);
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function (data) {

        process.stdout.write(data);
    });
    child.on('error',function (err){
        console.log('===============================')
        process.stdout.write(err);

    })
    child.on('close', function (code) {
        if (code == 100){
            // special case for updating
            startApp()

        }
        console.log('process exit code ' + code);
    });
}