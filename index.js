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
    //TODO format the website so that https://en.google.com/aa/ddd/ will turn as en.google.com
    formatWebsite(website){
       // console.log("sadfdf"+website.replace(new RegExp("(.*//)?(www[.])?"),''));
        return website.replace(new RegExp("(.*//)?(www[.])?"),'').replace(new RegExp("(/.*)"),"");
    }
    formatWebsiteID(website){
        return this.formatWebsite(website).replace(new RegExp("[.]",'g'),"_");
    }
    formatResponse(res,website){
        let score = res[website];
        let trust = {}
        trust.reputation = score['0']['0'];
        trust.confidence = score['0']['1'];
        score.trustworthiness = trust;
        delete  score['0'];
        let safety = {};
        safety.reputation = score['4']['0'];
        safety.confidence = score['4']['1'];
        score.childSafety = safety;
        delete  score['4'];
        score.url = score.target;
        delete score.target;
        if(score['2'] != null)
            delete score['2'];
        if(score['1'] != null)
            delete score['1'];
        score.lastModified = Date.now().toString();
        score.visits = 1;
        return score;
    }
    sendRequest(website){
        let requester = this;
        return fetch(this.requestTemplate1+website+this.requestTemplate2+this.key)
            .then(function(res){
                return res.json();
            }).then(function(json){
                return requester.formatResponse(json,website);
            });
    }
    formatHundredQueries(historyKeys,index){
        let keysToFormat = new Array();
        while(keysToFormat.length < 100 && index < historyKeys.length){

        }
    }
    addToRequest(reqKeys,res,historyKeys,index){//reqKeys = input keys,res = , historyKeys = output keys, index = index of websites added so far
        let requester = this;
        if(historyKeys.length < 100 && index < reqKeys.length){
           // console.log(index);
            let website = requester.formatWebsite(reqKeys[index]);
            let websiteID = requester.formatWebsiteID(reqKeys[index]);
           // console.log(reqKeys[index]);
            index++;
            return database.ref("website/"+websiteID).once("value").then(function(snapshot){
                if(snapshot.exists() && Date.now()-snapshot.val().lastModified< THIRTYMININMILISEC) {
                    res.push(snapshot.val());
                    return requester.addToRequest(reqKeys,res,historyKeys,index);
                }
                else{
                    historyKeys.push(website);
                    return requester.addToRequest(reqKeys,res,historyKeys,index);
                }
            });
        }
        else{
            console.log("Done");
            //console.log({res,historyKeys,index});
            return {res,historyKeys,index};
        }
    }
    /*
    sendHundredRequests(history,index){
        
    }

    sendRequests(history){
        return new Promise((history,index)=>{

        });
        return fetch(this.requestTemplate1+websites+this.requestTemplate3+this.key)
            .then(function(res){
                return res.json();
            }).then(function(json){
                return json;
            });
    }
    */
}

class History{
    constructor(){
        this.history = new Array();
    }

    // TODO we need to avoid duplicates so use dictionary or some list
    json2array(json,index ){
        let tmpIndex = index;
        let history = this.history;
        let keys = Object.keys(json);
        let historyEntry;
        let doExist=false;
        keys.forEach(function (key) {
            historyEntry = json[key];
            doExist=false;
            //console.log('historyEntry:' + historyEntry.url + "--" + historyEntry.lastVisitTime);

            for(let i  in history){
                //console.log('Exists:' + history[i].url.indexOf(historyEntry.url));
                // TODO format the url to so that only the nessecary components remain (currently the url isn't formated sot google.com/aa and google.com/bb will be treated as different entries
                if(history[i].url.indexOf(historyEntry.url)==0){
                    var d1 = new Date(historyEntry.lastVisitTime);
                    //console.log('d1:' + d1);

                    var d2 = new Date(history[i].lastVisitTime);
                    if(d1 >  d2){
                        //console.log('Exists22:' + history[i].url.indexOf(historyEntry.url));
                        history[i].lastVisitTime=historyEntry.lastVisitTime;
                        // TODO Even if the this is not the lastVisited, it doesn't change the fact we visited the site a number of times so regardless of the last time visited we need to add the visitCount
                        history[i].visitCount+=historyEntry.visitCount;
                        doExist=true;
                    }
                }
            }

            if(!doExist) {
                history.splice(tmpIndex, 0, json[key]);
                tmpIndex++;
            }
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
    //history.push("string 1");
    //history.push("string 2");
    res.send("test history");
});
//===============================================================
//================Scenario 1================
app.get("/score/:website",function(req,res){
    let websiteID = requester.formatWebsiteID(req.params.website.toString());
    //console.log(websiteID);
    database.ref("website/"+websiteID).once("value").then(function(snapshot){
        if(snapshot.exists() && (queriesPerDay > MAXQUERYPERDAY || Date.now()-snapshot.val().lastModified< THIRTYMININMILISEC)){
            let update = snapshot.val();
            update.visits++;
            update.lastModified  = Date.now();
            database.ref("website/"+websiteID).update(update);
            res.send(update);
        }
        else{
            if(queriesPerDay < MAXQUERYPERDAY) {
                if (queriesPerSec < MAXQUERYPERSEC) {
                    queriesPerSec++;
                    queriesPerDay++;
                    requester.sendRequest(req.params.website).then((score)=>{
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