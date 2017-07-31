ll = require('./llibR6');
ll.getShowFrom('Aladdin','192.168.2.71:3112',function(o){
    console.log(JSON.stringify(o,null,4))

})