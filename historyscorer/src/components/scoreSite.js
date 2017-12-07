import React, { Component } from 'react';
import './App.css';

fetch = require('node-fetch');
class ScoreSite extends React.Component{
    constructor(props){
        super(props);
        this.state={invalidMsg:"",scoreResult:null};
    }
    getScore(input){
        let errMsg =input  + "'s information could not be found.";

        fetch("https://infinite-peak-34901.herokuapp.com/score/" + input,{
            headers: {'Accept': 'application/json','Content-Type': 'application/json'},
            method: "PUT",}).then((res)=>{this.setState({invalidMsg:errMsg}); return res.json()}).then((res)=>{
            var value = res;
            //errMsg="ggg";
            this.setState({invalidMsg:null});
            //this.setState({invalidMsg:JSON.stringify(value)});

            let risks = Object.keys(res.categories);
            let riskString="";

            for(let r of risks)
                riskString = riskString+r+',';
            fetch("https://infinite-peak-34901.herokuapp.com/convertRisks/?risks="+riskString,{
                headers: {'Accept': 'application/json','Content-Type': 'application/json'},
                method: "GET"}).then((res)=>{return res.json()}).then((res)=>{
                riskString = "";
                for(let i of res.risks)
                    riskString += i+",";
                if(res.risks.length!= 0)
                    riskString = riskString.substring(0,riskString.length-1);
                else
                    riskString = "None Found";
                value.risks = riskString;
                console.log(riskString);
                this.setState({scoreResult:value});
            });

        });
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

    renderScore(){
        let score = this.state.scoreResult;
        if (score == null){
            return (<div></div>);
        }
    return (
           <section>
                <div>{score.url}</div>
                <span>URL:</span>
                <a href={"http://"+score.url} target="_blank">{score.url}</a><br/>
                {score.lastVisitTime != null &&<div>Last Time Visit: {score.lastVisitTime}</div>}
                <div>Trustworthiness: {score.trustworthiness.reputation}</div>
                <div>Child Safety: {score.childSafety.reputation}</div>
                <div>Risks: {score.risks}</div>
           </section>
        );
    }

    handleClick(){
        let webSite= document.getElementById('txtScoreSite');
        let validWeb = this.getHostName(webSite.value);
        let invalidSiteString = "";

        if(validWeb!=null) {
            this.setState({invalidMsg:null});
            this.setState({scoreResult:null});
            this.getScore(validWeb);
        }else{
            //this.setState({scoreResult:null});
            invalidSiteString = "You have entered an invalid website. " + webSite.value;
            this.setState({invalidMsg:invalidSiteString});
        }
        webSite.value="";
    }
    render(){
        return (
            <section>
                <div>
                    <input id="txtScoreSite" type="text" placeholder="Enter site"/>
                    <button onClick={(e) => this.handleClick()}>Score Site</button>
                </div>
                <div className="Info">
                    <div className="hint">Enter a website above (Example: amazon.com) and press Score Site to score a website</div>
                </div>
                <div id="invalidMsg">{this.state.invalidMsg}</div>
                <div><img src={require('./wotScore.JPG')} width="450" height="150"/></div>

                { this.renderScore()}

            </section>

        );
    }
}
export default ScoreSite;
