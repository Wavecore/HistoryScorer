var express = require('express');
var app = express();
var fetch = require('node-fetch');
var bodyParser = require('body-parser');
var temp = "Default";
app.set('port',(process.env.PORT || 5000));
app.use(bodyParser.json());
app.listen(app.get('port'),function(){
    console.log('Node app is running on port', app.get('port'));
});

app.get("/GET",function(req,res){
    res.send(temp);
});
app.put("/PUT/:value",function(req,res){
    temp = req.params.value;
    res.sendStatus(200);
});
/*fetch('http://api.mywot.com/0.4/public_link_json2?hosts=piazza.com/&key=6a61298751dcc88830b430677620aadde46cd213')
.then(function(res){
   return res.json();
}).then(function(json){
    console.log(json);
});
*/