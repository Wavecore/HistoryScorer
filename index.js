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
    }
    getHostName(url) {
        if(this.isValidURL(url)){
            let hostName = url;
            hostName = hostName.replace(new RegExp('^((https?:)?\/\/)'),"");
            hostName = hostName.replace(new RegExp('www\\.'),"");
            hostName = hostName.replace(new RegExp('\/.*'),"");
            if(this.isValidURL(hostName))
                return hostName;
            else
                return null;
        }
        else
            return null;
    }
    isValidURL(str) {
        var pattern = new RegExp('^((https?:)?\\/\\/)?'+ // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
            '(\\#[-a-z\\d_]*)?$','i'); // fragment locater
        if (!pattern.test(str)) {
            return false;
        } else {
            return true;
        }
    }
    formatWebsiteID(website){
        let formatted = this.getHostName(website);
        if(formatted != null)
            return formatted.replace(new RegExp("[.]",'g'),"_");
        else
            return null;
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
        //console.log("here");
        return fetch(this.requestTemplate1+website+this.requestTemplate2+this.key)
            .then(function(res){
                return res.json();
            }).then(function(json){
                return requester.formatResponse(json,website);
            });
    }
    //NOTE: 1 = stopped because reached daily request count
    //NOTE: 0 = completed normally
    //NOTE: -1 = Ran into error
    sendManyWebsites(history,res,index){
        let keysToFormat = Object.keys(history);
        let requester = this;
        if(queriesPerDay > MAXQUERYPERDAY)
            return {"res":res,"status":1};
        if(keysToFormat.length > index){
            //console.log(keysToFormat);
            return this.addToRequest(keysToFormat,res,[],index).then(function(resp){//,webKeys,index){
                //console.log(resp);
                let res = resp.res;
                let webKeys = resp.webKeys;
                let index = resp.index;
                let websites = "";
                for(let i of webKeys) {
                    websites += i +"/";
                }
                websites = websites.substring(0,websites.length-1);
                return fetch(requester.requestTemplate1+websites+requester.requestTemplate2+requester.key)
                    .then(function(res){
                        return res.json();
                    }).then(function(json){
                        for(let i of webKeys){
                            let val = requester.formatResponse(json,i);
                            if(history[i].lastVisitTime != undefined)
                                val.lastVisitTime =  history[i].lastVisitTime;
                            val.visits = history[i].visitCount;
                            //res.push({i:val});
                            res[i] = val;
                        }
                        queriesPerSec++;
                        queriesPerDay++;
                        return requester.sendManyWebsites(history,res,index);
                    });
            });
        }
        return {"res":res,"status":0};
    }
    addToRequest(historyKeys,res,webKeys,index){//historyKeys = input keys,res = website information, webKeys = output keys, index = index of websites added so far
        let requester = this;
       // console.log(historyKeys);
        if(webKeys.length < 100 && index < historyKeys.length){
            //console.log(index);
            let websiteID;
            let website = requester.getHostName(historyKeys[index]);
           // console.log(website);
            if(website != null)
                websiteID = requester.formatWebsiteID(historyKeys[index]);
            else
                return null;
            index++;
            //console.log("here");
            return database.ref("website/"+websiteID).once("value").then(function(snapshot){
                if(snapshot.exists() && Date.now()-snapshot.val().lastModified< THIRTYMININMILISEC) {
                    let entry = snapshot.val();
                    if(entry.visits != undefined)
                        entry.visits += historyReq.history[website].visitCount;
                    if(entry.lastVisitTime != undefined && historyReq.history[website].lastVisitTime != undefined &&
                        (new Date(entry.lastVisitTime) < new Date(historyReq.history[website].lastVisitTime)))
                        entry.lastVisitTime = historyReq.history[website].lastVisitTime
                    else if(entry.lastVisitTime == undefined && historyReq.history[website].lastVisitTime != undefined)
                        entry.lastVisitTime = historyReq.history[website].lastVisitTime
                    res[website] = entry;
                    return requester.addToRequest(historyKeys,res,webKeys,index);
                }
                else{
                    webKeys.push(website);
                    return requester.addToRequest(historyKeys,res,webKeys,index);
                }
            });
        }
        else{
            //console.log(webKeys);
            return {res,webKeys,index};
        }
    }
}

class History{
    constructor(){
        this.history = {}; //new Array();
    }

    getDomain(url) {
        var hostName = this.getHostName(url);
        var domain = hostName;

        if (hostName != null) {
            var parts = hostName.split('.').reverse();

            if (parts != null && parts.length > 1) {
                domain = parts[1] + '.' + parts[0];

                if (hostName.toLowerCase().indexOf('.co.uk') != -1 && parts.length > 2) {
                    domain = parts[2] + '.' + domain;
                }
            }
        }

        return domain;
    }
    getHostName(url) {
        if(this.isValidURL(url)){
            let hostName = url;
            hostName = hostName.replace(new RegExp('^((https?:)?\/\/)'),"");
            hostName = hostName.replace(new RegExp('www\\.'),"");
            hostName = hostName.replace(new RegExp('\/.*'),"");
            //console.log(hostName);
            if(this.isValidURL(hostName))
                return hostName;
            else
                return null;
        }
        else
            return null;
    }
    isValidURL(str) {
        var pattern = new RegExp('^((https?:)?\\/\\/)?'+ // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
            '(\\#[-a-z\\d_]*)?$','i'); // fragment locater
        if (!pattern.test(str)) {
            return false;
        } else {
            return true;
        }
    }
    json2Dictionary(json){
        let historyClass = this;
        let history = this.history;
        let keys = Object.keys(json);
        let historyEntry;
        keys.forEach(function (key) {
            historyEntry = json[key];
            delete historyEntry.id;
            let webkey =  historyClass.getHostName(historyEntry.url);
            if(webkey != null){
                if(history[webkey] == undefined){
                    history[webkey] = historyEntry;
                }
                else
                {
                    let entry = history[webkey];
                    if(entry.lastVisitTime != undefined && historyEntry.lastVisitTime != undefined &&
                        (new Date(entry.lastVisitTime) > new Date(historyEntry.lastVisitTime)))
                        entry.lastVisitTime = historyEntry.lastVisitTime;
                    entry.visitCount = entry.visitCount+historyEntry.visitCount;
                    history[webkey] = entry;
                }
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
let tempHistory = {'chrome.google.com':{ id: 11111,
        visitCount: 2,
        lastVisitTime: '2017-09-28T15:58:49.045Z',
        title: 'Chrome Web Store - Extensions',
        url: 'chrome.google.com' },
    'search.norton.com':{ id: 22222,
        visitCount: 183,
        lastVisitTime: '2017-09-28T15:55:04.884Z',
        title: 'Safe Search',
        url: 'search.norton.com' },
    'amazon.com': { id: 222555,
        visitCount: 12,
        lastVisitTime: '2017-09-28T15:57:04.884Z',
        title: 'Amazon',
        url: 'amazon.com' },'piazza.com':
    { id: 33333,
        visitCount: 30,
        lastVisitTime: '2017-09-28T15:52:33.483Z',
        title: 'SWE 432',
        url: 'piazza.com' }};
//============================================================================================
//console.log("chrome.google.com  :"+historyReq.isValidURL("chrome.google.com"));  //True
//console.log("search.norton.com  :"+historyReq.isValidURL("search.norton.com"));  //True
//let web = ['www.demo.com','http://foo.co.uk/','http://regexr.com/foo.html?q=bar','https://mediatemple.net','http://www.piazza.com/bb','www.piazza.com/aa','http://www2.amazon.com/folder/page.html?q=1','chrome.google.com'];
//web.forEach((res)=>{
//    console.log(res+"  :"+historyReq.isValidURL(res)+"   "+historyReq.getHostName(res));  //True
//});
//console.log("http://www2.amazon.com/folder/page.html?q=1  :"+historyReq.isValidURL("http://www2.amazon.com/folder/page.html?q=1")); //True
//var temp = requester.addToRequest(Object.keys(tempHistory),{},[],0).then(function(res){console.log(res.webKeys)});
//var temp = requester.sendManyWebsites(tempHistory,{},0).then(function(res,status){console.log(res);});
//============================================================================================
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
    res.send("test history1");
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
//=============Scenario 2======================
app.get("/scores",function(req,res){
   // console.log("start");
    requester.sendManyWebsites(historyReq.history,{},0).then(function(response){
        //console.log("query is done");
        let status = response.status;
        let resp = response.res;
        //console.log(status);
        //console.log(resp);
        if(status != -1){
            for(let i in resp){
                //console.log(i);
                let webID = requester.formatWebsiteID(i);
                //console.log(webID);
                database.ref("website/"+webID).once("value").then(function(snapshot){
                    if(snapshot.exists()){//} && resp[i].lastModified > snapshot.val().lastModified) {
                        database.ref("website/"+webID).update(resp[i]);
                        //res.push(snapshot.val());
                        //return requester.addToRequest(historyKeys,res,webKeys,index);
                    }/*
                    else if(snapshot.exists()){
                        resp[i].visits = resp[i].visits + snapshot.val().visits
                        database.ref("website/"+webID).set(resp[i]);
                    }*/
                    else{
                        database.ref("website/"+webID).set(resp[i]);
                    }
                });
            }
            res.send(resp);
        }
        //console.log(res);
    });
});
//=============Scenario 3======================
app.post('/newsite/:website',function (req,res) {
    let website = {};
    website.visitCount = 1;
    website.url = req.params.website;
    historyReq.json2Dictionary({0:website});
    //console.log(historyReq.history);
    //console.log("==================================================");
    res.sendStatus(200);
});
//=============Scenario 4======================
app.post('/newsites',function(req,res){
    historyReq.json2Dictionary(req.body);
    console.log(historyReq.history);
    //console.log("==================================================");
    res.sendStatus(200);
});
//================Scenario 5===========================
app.delete("/deleteWeb/:website", function(req,res){
    let website = req.params.website;
    console.log("website==================================================" + website);
    historyReq.deleteByName(website);
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