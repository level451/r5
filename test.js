ll = require('./llibR6');
// ll.getShowFrom('Wicked','10.6.1.88:3112',function(o){
//     console.log(JSON.stringify(o,null,4))
//
// })
ll.getShowVersions((data)=> {
    console.log(JSON.stringify(data,null,4))

})