import React, { Component } from 'react';
import './aside.css';

fetch = require('node-fetch');
class Ranking extends React.Component{
    constructor(props){
        super(props);
        this.state={component:null,
                    value:{trustworthiness:{},
                            childSafety:{}}};
        if(props.type == "Good") {
            this.state.type = "Top Scoring Site";
            this.state.query = "mostVisitedGoodWebsite"
        }
        else{
            this.state.type = "Worse Scoring Site";
            this.state.query = "mostVisitedBadWebsite"
        }
    }
    componentDidMount(){
        fetch("https://infinite-peak-34901.herokuapp.com/"+this.state.query,{
            headers: {'Accept': 'application/json','Content-Type': 'application/json'},
            method: "GET",}).then((res)=>{return res.json()}).then((res)=>{
            var value = res;
            let risks = Object.keys(res.categories);
            let riskString;
            for(let r of risks)
                riskString = r+',';
            fetch("https://infinite-peak-34901.herokuapp.com/convertRisks/?risks="+riskString,{
                headers: {'Accept': 'application/json','Content-Type': 'application/json'},
                method: "GET"}).then((res)=>{return res.json()}).then((res)=>{
                let riskString = "";
                for(let i of res.risks)
                    riskString += i+",";
                if(res.risks.length!= 0)
                    riskString = riskString.substring(0,riskString.length-1);
                else
                    riskString = "None Found";
                value.risks = riskString;
                this.setState({value:value});
                //
            });
        });
    }
    render(){
        return (
            <aside>
                <div>{this.state.type}</div>
                <a href={"http://" + this.state.value.url} target="_blank">{this.state.value.url}</a><br/>
                <div>Trustworthiness: {this.state.value.trustworthiness.reputation}</div>
                <div>Child Safety: {this.state.value.childSafety.reputation}</div>
                <div>Visits: {this.state.value.visits}</div>
                <div>Risks: {this.state.value.risks}</div>
            </aside>
        );
    }
}
class WebRanking extends Component {
    render() {

        return (
            <div>
                {this.renderRanking("Good")}
                {this.renderRanking("Bad")}
            </div>
        );
    }
    renderRanking(type){
        return (<Ranking type={type}/>);
    }
}

export default WebRanking;
