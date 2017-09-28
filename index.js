var express = require('express');
var fetch = require('node-fetch');

fetch('http://api.mywot.com/0.4/public_link_json2?hosts=yahoo.com/&key=6a61298751dcc88830b430677620aadde46cd213')
.then(function(res){
   return res.json();
}).then(function(json){
    console.log(json);
});