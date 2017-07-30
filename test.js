ll = require('./llibR6');
ll.getShowFrom('Ham','10.6.1.88:3112',function(o){
    console.log(JSON.stringify(o,null,4))

})