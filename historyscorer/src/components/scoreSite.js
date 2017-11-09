import React, { Component } from 'react';
import './App.css';

fetch = require('node-fetch');
class ScoreSite extends React.Component{
    constructor(props){
        super(props);
        this.state={scoreResult:null};
    }
    getScore(input){
        fetch("https://infinite-peak-34901.herokuapp.com/score/" + input,{
            headers: {'Accept': 'application/json','Content-Type': 'application/json'},
            method: "PUT",}).then((res)=>{return res.json()}).then((res)=>{
            var value = res;
            //this.setState({results:JSON.stringify(value)});
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

        if(validWeb!=null) {
            this.getScore(validWeb);
        }else{
            this.setState({scoreResult:null});
        }
        webSite.value="";
    }
    render(){
        return (
            <section>
                <div className="ScoreSite">
                    <button onClick={(e) => this.handleClick()}>Score Site</button>
                </div>
                <div className="Info">
                   <div><label htmlFor="loadFile" className="control-label">Enter site below to review score. (Example: Amazon.com)</label></div>
                </div>
                <div className="siteInput">
                    <input id="txtScoreSite" type="text" placeholder="Enter site"/>
                </div>

                { this.renderScore()}

            </section>

        );
    }
}
export default ScoreSite;
