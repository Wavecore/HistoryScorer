var express = require('express');
var app = express();
var fetch = require('node-fetch');
var bodyParser = require('body-parser');
const firebase = require("firebase");

var config = {
    apiKey: "AIzaSyAAN8iqfAOt19rUcDnODW5zByhyftiCVLM",
    authDomain: "swe432-wothistoryanalyzer.firebaseapp.com",
    databaseURL: "https://swe432-wothistoryanalyzer.firebaseio.com",
    projectId: "swe432-wothistoryanalyzer",
    storageBucket: "swe432-wothistoryanalyzer.appspot.com",
    messagingSenderId: "607481226239"
};
firebase.initializeApp(config);
var database = firebase.database();
var queriesPerSec = 0;
const MAXQUERYPERSEC = 10;
var queriesPerDay = 0;
const MAXQUERYPERDAY = 25000;
const THIRTYMININMILISEC = 1800000;
var history;

class WOTRequester{
    constructor(key){
        this.key = key;
        this.requestTemplate1 = 'http://api.mywot.com/0.4/public_link_json2?hosts=';
        this.requestTemplate2 = '/&key=';
        this.requestTemplate3 = '&keys=';
    }
    sendRequest(website){
        return fetch(this.requestTemplate1+website+this.requestTemplate2+this.key)
            .then(function(res){
                return res.json();
            }).then(function(json){
                return json;
            });
    }
    sendRequests(websites){
        return fetch(this.requestTemplate1+websites+this.requestTemplate3+this.key)
            .then(function(res){
                return res.json();
            }).then(function(json){
                return json;
            });
    }
}

class HistoryParser{
    constructor(history,requestor){
        this.history = history;
        this.requestor = requestor;
    }
}
var requester = new WOTRequester("6a61298751dcc88830b430677620aadde46cd213");
setInterval(()=>{
    queriesPerSec = 0;
    },1000);
setInterval(()=>{
    queriesPerDay = 0;
    },86400000);
var temp = "Default";
app.set('port',(process.env.PORT || 5000));
app.use(bodyParser.json());
app.listen(app.get('port'), function(){
    console.log('Node app is running on port', app.get('port'));
});

app.get("/GET",function(req,res){
    res.send(temp);
});
app.get("/score/:website",function(req,res){
    let websiteID = req.params.website.replace(".","_");
    //console.log(websiteID);
    database.ref("website/"+websiteID).once("value").then(function(snapshot){
        if(snapshot.exists() && (queriesPerDay > MAXQUERYPERDAY || Date.now()-snapshot.val().lastModified< THIRTYMININMILISEC)){
            let update = snapshot.val();
            update.visits++;
            database.ref("website/"+websiteID).update(update);
            res.send(snapshot.val());
        }
        else{
            if(queriesPerDay < MAXQUERYPERDAY) {
                if (queriesPerSec < MAXQUERYPERSEC) {
                    queriesPerSec++;
                    queriesPerDay++;
                    requester.sendRequest(req.params.website).then((json)=>{
                        let score = json[req.params.website];
                        score.trustworthiness = score['0'];
                        score.childSafety = score['4'];
                        delete  score['0'];
                        delete  score['4'];
                        if(score['2'] != null)
                            delete score['2'];
                        if(score['1'] != null)
                            delete score['1'];
                        score.lastModified = Date.now().toString();
                        score.visits = 1;
                        database.ref("website/"+websiteID).set(score);
                        res.send(score);
                    });
                }
            }
            else
                res.sendStatus(429); //User has sent too many requests in a given amount of time
        }
    });

});
app.get("/scores",function(req,res){
    let sites = req.body;
    let websites;
    for(var i in sites)
        websites += sites[i]+'/'
    requester.sendRequests(websites).then((json)=>{
        console.log(json);
    });
    //console.log(websites);
});
app.put("/PUT/:value",function(req,res){
    temp = req.params.value;
    res.sendStatus(200);
});
var nStartTime = Date.now();
var nEndTime = Date.now();
/*fetch('http://api.mywot.com/0.4/public_link_json2?hosts=piazza.com/&key=6a61298751dcc88830b430677620aadde46cd213')
.then(function(res){
   return res.json();
}).then(function(json){
    console.log(json);
});
*/