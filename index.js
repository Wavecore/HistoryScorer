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

class History{
    constructor(){
        this.history = new Array();
    }

    json2array(json,index ){
        let tmpIndex = index;
        let history = this.history;
        let keys = Object.keys(json);
        keys.forEach(function (key) {
            history.splice(tmpIndex, 0, json[key]);
            tmpIndex++;
        });
        this.history = history;
    }
    deleteByName(websiteName){
        let index = -1;
        for(let i  in this.history)
            if(this.history[i].url == websiteName)
                index = i;
        if(index >= 0)
            this.deleteByIndex(index);
    }
    deleteByIndex(index){
        if(index < this.history.length)
            this.history.splice(index,1);
    }
    clear(){
        this.history = [];
    }
}
var requester = new WOTRequester("6a61298751dcc88830b430677620aadde46cd213");
var historyReq = new History();
setInterval(()=>{
    queriesPerSec = 0;
    },1000);
setInterval(()=>{
    queriesPerDay = 0;
    },86400000);
app.set('port',(process.env.PORT || 5000));
app.use(bodyParser.json());
app.listen(app.get('port'), function(){
    console.log('Node app is running on port', app.get('port'));
});
//=====================Debugging=================================
app.get("/GET",function(req,res){
    history.push("string 1");
    history.push("string 2");
    res.send(history);
});
//===============================================================
//================Scenario 1================
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
//=============Scenario 3======================
app.post('/newsite/:website/:index?',function (req,res) {
    let index = req.params.index;
    if(index == undefined) {
        index = 0;
    }
    if(index > historyReq.history.length)
        index = historyReq.history.length;
    let website = {};
    website.visitCount = 1;
    website.url = req.params.website;
    historyReq.json2array({0:website},index);
    console.log(historyReq.history);
    console.log("==================================================");
    res.sendStatus(200);
});
//=============Scenario 4======================
app.post('/newsites/:index?',function(req,res){
    let index = req.params.index;
    if(index == undefined) {
        index = 0;
    }
    if(index > historyReq.history.length)
        index = historyReq.history.length;
    historyReq.json2array(req.body,index);
    console.log(historyReq.history);
    console.log("==================================================");
    res.sendStatus(200);
});
//================Scenario 5===========================
app.delete("/deleteWeb/:website", function(req,res){
    let website = req.params.website;
    historyReq.deleteByName(website);
    console.log(historyReq.history);
    res.sendStatus(200);
});
//================Scenario 6===========================
app.delete("/deleteIndex/:index", function(req,res){
    let index = req.params.index;
    historyReq.deleteByIndex(index);
    console.log(historyReq.history);
    res.sendStatus(200);
});
//===============Scenario 7================
app.delete("/clear",function(req,res){
    historyReq.clear();
    console.log(historyReq.history);
    res.sendStatus(200);
});
//===============Scenario 10===============
app.get("/history",function(req,res){
    res.send(historyReq.history);
});


/*
app.put("/scores",function(req,res){
    let sites = req.body;
    console.log(req);
    console.log(sites);
    let websites = "";
    for(var i in sites)
        websites += sites[i]+'/'
    console.log(websites);
    requester.sendRequests(websites).then((json)=>{
        console.log(json);

        res.sendStatus(200);
    });
    //console.log(websites);
});
*/