import React, { Component } from 'react';
import logo from '../logo.svg';
import BrowsingScore from "./BrowsingScore";

class ScoreView extends Component {
    constructor(props){
        super(props);
        this.move = props.move;
        this.state = {};
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
        console.log("here");
        var x = document.getElementById("resultSelection");
        console.log("SelectedIndex: "+x.selectedIndex);
    }
    render() {
        return (<div>
            {this.renderBrowsingScore()}
            <select multiple name="resultSelection" onSelect={()=>{this.getSelected()}}>
                <option value="Malware">malware.com  Score: 20</option>
                <option value="Youtube">youtube.com  Score: 50</option>
                <option value="ebay">ebay.com  Score: 70</option>
                <option value="cnn">cnn.com  Score: 60</option>
                <option value="nbc">nbc.com  Score: 50</option>
                <option value="cbs">cbs.com  Score: 40</option>
            </select>
        </div>);
    }
}

export default ScoreView;
