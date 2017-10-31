import React, { Component } from 'react';
import logo from '../logo.svg';
import BrowsingScore from "./BrowsingScore";

class ScoreView extends Component {
    constructor(props){
        super(props);
        this.move = props.move;
        this.state = {};
        this.state.selected = null;
        this.state.selectedRisk= "";
        this.state.input = props.value;
        this.state.output = {browsingScore:0,risks:"",scores:{}};
    }
    renderBrowsingScore(){
        let riskString = "";
        for(let i of this.state.output.risks)
            riskString += i+",";
        if(this.state.output.risks.length!= 0)
            riskString = riskString.substring(0,riskString.length-1);
        else
            riskString = "None Found";
        return (<div>
            <div>Browsing Score: {Math.floor(this.state.output.browsingScore)}</div>
            <div>Risks: {riskString}</div>
        </div>);
    }
    renderSelectedScore(){
        if(this.state.selected == null) return(<td></td>);
        let score = this.state.output.scores[this.state.selected];
       return(
           <aside >
                <div>{this.state.selected}</div>
                <span>URL:</span>
                <a href={"http://"+score.url} target="_blank">{this.state.selected}</a><br/>
                <div>Visits: {score.visits}</div>
                <div>Last Time Visit: {score.lastVisitTime}</div>
                <div>Trustworthiness: {score.trustworthiness.reputation}</div>
                <div>Child Safety: {score.childSafety.reputation}</div>
                <div>Risks: {this.state.selectedRisk}</div>
            </aside>);
    }
    componentDidMount() {
        if(Object.keys(this.state.input).length != 0) {
            fetch("https://infinite-peak-34901.herokuapp.com/scores", {
                headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
                method: "PUT", body: JSON.stringify({"chrome.google.com":{"visitCount":2,"lastVisitTime":"2017-09-28T15:58:49.045Z","title":"Chrome Web Store - Extensions","url":"chrome.google.com"},"youtube.com":{"visitCount":183,"lastVisitTime":"2017-09-28T15:55:04.884Z","title":"Safe Search Norton","url":"youtube.com"},"amazon.com":{"visitCount":225,"lastVisitTime":"2017-09-28T15:57:04.884Z","title":"Amazon","url":"amazon.com"},"piazza.com":{"visitCount":30,"lastVisitTime":"2017-09-28T15:51:33.483Z","title":"SWE 432","url":"piazza.com"},"demo.com":{"visitCount":17,"lastVisitTime":"2017-09-28T15:52:33.483Z","title":"Demo","url":"demo.com"},"developer.mozilla.org":{"visitCount":17,"lastVisitTime":"2017-09-28T15:52:33.483Z","title":"Demo","url":"developer.mozilla.org"},"regexr.com":{"visitCount":375,"lastVisitTime":"2017-09-28T15:52:33.483Z","title":"Demo","url":"regexr.com"},"piratebay.com":{"visitCount":300,"lastVisitTime":"2017-09-28T15:52:33.483Z","title":"Demo","url":"piratebay.com"},"chia-anime.tv":{"visitCount":300,"lastVisitTime":"2017-09-28T15:52:33.483Z","title":"Demo","url":"chia-anime.tv"}}
                )
            }).then((res) => {
                return res.json()
            }).then((json) => {
                this.setState({input:this.state.input,output:json});
            });
        }
    }
    getSelected(){
        var x = document.getElementById("resultSelection");
        let risks = Object.keys(this.state.output.scores[x.value].categories);
        console.log(risks);
        let riskString = "";
        for(let r of risks)
            riskString = riskString+r+',';
        console.log(riskString);
        fetch("https://infinite-peak-34901.herokuapp.com/convertRisks/?risks="+riskString,{
            headers: {'Accept': 'application/json','Content-Type': 'application/json'},
            method: "GET"}).then((res)=>{return res.json()}).then((res)=>{
            console.log(res);
            let riskString = "";
            for(let i of res.risks)
                riskString += i+",";
            if(res.risks.length!= 0)
                riskString = riskString.substring(0,riskString.length-1);
            else
                riskString = "None Found";
            this.setState({selected:x.value,selectedRisk:riskString});
            //
        });
    }
    render() {
        return (<div>
            {this.renderBrowsingScore()}
            <select multiple id="resultSelection" onClick={()=>{this.getSelected()}}>
                {Object.keys(this.state.output.scores).map((key)=>{
                    return(
                        <option key={key} value={key}>
                            {key}  Score: {this.state.output.scores[key].trustworthiness.reputation}
                            </option>)})}
            </select>
            {this.renderSelectedScore()}

        </div>);
    }
}

export default ScoreView;
