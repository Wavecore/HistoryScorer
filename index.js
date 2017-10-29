var express = require('express');
var app = express();
const path = require('path');
var fetch = require('node-fetch');
var bodyParser = require('body-parser');
const firebase = require("firebase");
app.use(express.static(path.join(__dirname, 'historyscorer/build')));
//app.use(express.static('public'));
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
        this.categoryID = {
            101:"Malware or viruses",
            102:"Poor customer experience",
            103:"Phishing",
            104:"Scam",
            105:"Potentially illegal",
            201:"Misleading claims or unethical",
            202:"Privacy risks",
            203:"Suspicious",
            204:"Hate, discrimination",
            205:"Spam",
            206:"Potentially unwanted programs",
            207:"Ads/ pop-ups",
            301:"Online tracking",
            302:"Alternative or controversial medicine",
            303:"Opinions, religion, politics",
            304:"Other",
            401:"Adult content",
            402:"Incidental nudity",
            403:"Gruesome or shocking",
            404:"Site for kids",
            501:"Good site"
        };
    }
    getHostName(url) {
        if(this.isValidURL(url)){
            let hostName = url;
            hostName = hostName.replace(new RegExp('^((https?:)?\/\/)'),"");
            hostName = hostName.replace(new RegExp('^www[0-9]*\\.'),"");
            hostName = hostName.replace(new RegExp('\/.*'),"");
            hostName = hostName.replace(new RegExp(' '),"");
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
    convertCategories(identrifier){
        return this.categoryID[identrifier];
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
        if(score['0'] == undefined)
            return undefined;
        trust.reputation = score['0']['0'];
        trust.confidence = score['0']['1'];
        score.trustworthiness = trust;
        delete  score['0'];
        let safety = {};
        if(score['4'] == undefined)
            return undefined;
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
        if(score.visits == undefined)
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
                console.log(json);
                if(json != undefined)
                    return requester.formatResponse(json,website);
                else
                    return json;
            });
    }
    scoreWebsite(website){
        requester = this;
        let webName = requester.getHostName(website);
        let websiteID = requester.formatWebsiteID(website);
        return database.ref("website/"+websiteID).once("value").then(function(snapshot){
            if(snapshot.exists() && (queriesPerDay > MAXQUERYPERDAY || Date.now()-snapshot.val().lastModified< THIRTYMININMILISEC)){
                let update = snapshot.val();
                update.visits++;
                update.lastModified  = Date.now();
                database.ref("website/"+websiteID).update(update);
                return update;
            }
            else{
                if(queriesPerDay < MAXQUERYPERDAY) {
                    while(queriesPerSec >= MAXQUERYPERSEC)
                        queriesPerSec = queriesPerSec;
                    //if (queriesPerSec < MAXQUERYPERSEC) {
                    queriesPerSec++;
                    queriesPerDay++;
                    return requester.sendRequest(webName).then((score)=>{
                        if(score != undefined)
                            database.ref("website/"+websiteID).set(score);
                        return score;
                    });
                    //}
                }
                else
                    return null;//res.sendStatus(429); //User has sent too many requests in a given amount of time
            }
        });
    }
    //NOTE: 1 = stopped because reached daily request count
    //NOTE: 0 = completed normally
    //NOTE: -1 = Ran into error
    scoreWebsites(websites){
        return requester.sendManyWebsites(websites,{},0).then(function(response){
            let status = response.status;
            var resp = response.res;
            if(status != -1){
                Object.keys(resp).forEach((key)=>{
                    let webID = requester.formatWebsiteID(key);
                    let entry = {}
                    for(let index in resp[key])
                        entry[index] = resp[key][index];
                    database.ref("website/"+webID).once("value").then(function(snapshot){
                        if(snapshot.exists())
                            database.ref("website/"+webID).update(entry);
                        else
                            database.ref("website/"+webID).set(entry);
                    });
                });
                return resp;
            }
            return null;
        });
    }
    sendManyWebsites(history,res,index){
        let keysToFormat = Object.keys(history);
        let requester = this;
        if(queriesPerDay > MAXQUERYPERDAY)
            return {"res":res,"status":1};
        if(keysToFormat.length > index){
            //console.log(keysToFormat);
            return this.addToRequest(history,keysToFormat,res,[],index).then(function(resp){//,webKeys,index){
                //console.log(resp);
                let res = resp.res;
                //for(let index in res)
                 //   console.log("here2 "+res[index].url+"     "+res[index].visits);
                let webKeys = resp.webKeys;
                let index = resp.index;
                let websites = "";
                for(let i of webKeys) {
                    websites += i +"/";
                }
                websites = websites.substring(0,websites.length-1);
                if(queriesPerDay < MAXQUERYPERDAY) {
                    while (queriesPerSec >= MAXQUERYPERSEC)
                        queriesPerSec = queriesPerSec;
                    queriesPerSec++;
                    queriesPerDay++;
                    return fetch(requester.requestTemplate1 + websites + requester.requestTemplate2 + requester.key)
                        .then(function (res) {
                            return res.json();
                        }).then(function (json) {
                            for (let i of webKeys) {
                                if(history[i].visitCount != undefined)
                                    json[i].visits = history[i].visitCount;
                                let val = requester.formatResponse(json, i);
                                if(val == undefined)
                                    continue;
                                if (history[i].lastVisitTime != undefined)
                                    val.lastVisitTime = history[i].lastVisitTime;
                                res[i] = val;
                            }
                            return requester.sendManyWebsites(history, res, index);
                        });
                }
                else
                    return {"res":res,"status":1};
            });
        }
       // for(let index in res)
         //   console.log("here 3 "+res[index].url+"    "+res[index].visits);
        return {"res":res,"status":0};
    }
    addToRequest(history,historyKeys,res,webKeys,index){//historyKeys = input keys,res = website information, webKeys = output keys, index = index of websites added so far
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
                    var entry = snapshot.val();
                    if(entry.visits != undefined)
                        entry.visits += history[website].visitCount;
                    if(entry.lastVisitTime != undefined && history[website].lastVisitTime != undefined &&
                        (new Date(entry.lastVisitTime) < new Date(history[website].lastVisitTime)))
                        entry.lastVisitTime = history[website].lastVisitTime
                    else if(entry.lastVisitTime == undefined && history[website].lastVisitTime != undefined)
                        entry.lastVisitTime = history[website].lastVisitTime
                    res[website] = entry;
                    console.log(entry.url +"    "+entry.visits);
                    return requester.addToRequest(history,historyKeys,res,webKeys,index);
                }
                else{
                    webKeys.push(website);
                    return requester.addToRequest(history,historyKeys,res,webKeys,index);
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
            hostName = hostName.replace(new RegExp('^www[0-9]*\\.'),"");
            hostName = hostName.replace(new RegExp('\/.*'),"");
            hostName = hostName.replace(new RegExp(' '),"");
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
           // console.log(webkey);
            if(webkey != null){
                if(history[webkey] == undefined){
                    history[webkey] = historyEntry;
                    history[webkey].url=webkey;
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
    getVisitCountByNameInHistory(websiteName){
        let webName = this.getHostName(websiteName);
        if(this.history[webName] == undefined){
            return 0;
        }
        return this.history[webName].visitCount;
    }
    deleteByName(websiteName){
        let webName = this.getHostName(websiteName);
        delete this.history[webName];
    }
    clear(){
        this.history = {};
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
app.put("/score/:website",function(req,res){
    requester.scoreWebsite(req.params.website.toString()).then((resp)=>{
        if(resp == undefined)
            res.send("Website does not exist in database");
        res.send(resp);
    });
});
//=============Scenario 2======================
app.put("/scores",function(req,res){
    let history = req.body;
    requester.scoreWebsites(history).then((scores)=>{
        for(let index in scores)
            scores[index].visits = history[index].visitCount;
        res.send(scores);
    });
});
//=============Scenario 3======================
app.post('/newSite/:website',function (req,res) {
    let website = {};
    website.visitCount = 1;
    website.url = req.params.website;
    historyReq.json2Dictionary({0:website});
    res.sendStatus(200);
});
//=============Scenario 4======================
app.post('/newSites',function(req,res){
    historyReq.json2Dictionary(req.body);
    res.sendStatus(200);
});
//================Scenario 5===========================
app.delete("/deleteWeb/:website", function(req,res){
    let website = req.params.website;
    historyReq.deleteByName(website);
    res.sendStatus(200);
});
//================Scenario 6===========================
app.delete("/deleteWebs", function(req,res){
    let websites = req.body;
    for(let index in websites)
        historyReq.deleteByName(websites[index]);
    res.sendStatus(200);
});
//===============Scenario 7================
app.delete("/clear",function(req,res){
    historyReq.clear();
    res.sendStatus(200);
});
//===============Scenario 8===============
app.get("/browsingScore",function (req,res){
    let history = historyReq.history;
    let goodBrowsingScore = 0;
    let badBrowsingScore = 0;
    let goodTotal = 0;
    let badTotal = 0;
    let finalBrowsingScore = 0;
    requester.scoreWebsites(history).then((scores)=>{
        for(let index in scores){
            if(scores[index].trustworthiness.reputation >= 60){
                goodBrowsingScore += scores[index].trustworthiness.reputation * history[index].visitCount;
                goodTotal += history[index].visitCount;
            }
            else{
                badBrowsingScore += scores[index].trustworthiness.reputation * history[index].visitCount;
                badTotal += history[index].visitCount;
            }
        }
        let multiplier = Math.pow((goodTotal/(goodTotal+badTotal)),3);
        finalBrowsingScore = (goodBrowsingScore/goodTotal)*multiplier + (badBrowsingScore/badTotal)*(1-multiplier);
        res.send(""+Math.floor(finalBrowsingScore));
    });
});
//===============Scenario 9===============
app.get("/numVisitsInHistory/:website", function (req,res) {
    let website = req.params.website;
    res.send(""+historyReq.getVisitCountByNameInHistory(website));
});
//===============Scenario 10===============
app.get("/numVisitsInFirebase/:website", function (req,res) {
    let websiteID = requester.formatWebsiteID(req.params.website.toString());

    database.ref("website/"+websiteID).once("value").then(function(snapshot){
        if(snapshot.exists()){
            let post = snapshot.val();
            //console.log("Visits:" + post.visits);
            res.send(""+post.visits);
        }else{
            res.send(""+0);
        }
    });

});
//===============Scenario 11===============
app.get("/risks",function (req,res){
   let history = historyReq.history;
   let risks = [];
   requester.scoreWebsites(history).then((scores)=>{
        for(let index in scores){
            let categories = scores[index].categories;
            for(let risk in categories){
                if(risk == 404 || risk == 501)
                    continue;
                let riskDetail = requester.convertCategories(risk);
                if(riskDetail != undefined && risks.indexOf(riskDetail) == -1){
                    risks.push(riskDetail);
                }
            }
        }
        //console.log(risks);
        res.send(risks);
   });
});
//===============Scenario 12===============
app.get("/history",function(req,res){
    res.send(historyReq.history);
});
//===============Scenario 13==============
app.get("/mostVisitedWebsite",function(req,res){
    var data = Object.keys(historyReq.history).map(function ( key ) { return historyReq.history[key]; });
    // console.log(data.reduce((max, p) => p.visitCount > max ? p.visitCount : max, data[0].visitCount)); // returns the max visit count
    let maxVisit = data.reduce((prev, current) => (prev.visitCount > current.visitCount) ? prev : current)
    //console.log("maxVisit:" + maxVisit.url);
    res.send(maxVisit.url);
});
//===============Scenario 14==============
app.get("/mostVisitedGoodWebsite",function(req,res){
    database.ref("website").once("value").then(function(snapshot) {
        if(snapshot.exists()){
            let data = snapshot.val();
            let keys = Object.keys(data);
            let minVisit = keys.reduce((accumulator,current)=>{
                if(data[current].trustworthiness.reputation >= 60 && (accumulator == null || (data[current].visits > data[accumulator].visits)))
                    return current;
                else
                    return accumulator;
            },null);
            console.log(minVisit);
            res.send(data[minVisit]);
        }
        else
            res.send(null);
    });
});
app.get("/mostVisitedBadWebsite",function(req,res){
    database.ref("website").once("value").then(function(snapshot) {
        if(snapshot.exists()){
            let data = snapshot.val();
            let keys = Object.keys(data);
            let minVisit = keys.reduce((accumulator,current)=>{
                if(data[current].trustworthiness.reputation < 60 && (accumulator == null || (data[current].visits > data[accumulator].visits)))
                    return current;
                else
                    return accumulator;
            },null);
            console.log(minVisit);
            res.send(data[minVisit]);
        }
        else
            res.send(null);
    });
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