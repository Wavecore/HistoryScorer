import React, { Component } from 'react';

class ScoreView extends Component {
    constructor(props){
        super(props);
        this.move = props.move;
        this.state = {
            selected:null,
            selectedRisk:"",
            input:props.value,
            output: {browsingScore:0,risks:"",scores:{}}
        };
     //   this.state.selected = null;
     //   this.state.selectedRisk= "";
      //  this.state.input = props.value;
      //  this.state.output = {browsingScore:0,risks:"",scores:{}};
    }
    renderBrowsingScore(){
        let riskString = "";
        for(let i of this.state.output.risks)
            riskString += i+", ";
        if(this.state.output.risks.length!= 0)
            riskString = riskString.substring(0,riskString.length-2);
        else
            riskString = "None Found";
        return (<div>
            <div>Browsing Score: {Math.floor(this.state.output.browsingScore)}</div>
            <div>Risks: {riskString}</div>
        </div>);
    }
    renderSelectedScore(){
        if(this.state.selected == null) return(<span></span>);
        let score = this.state.output.scores[this.state.selected];
       return(
           <aside >
                <div>{this.state.selected}</div>
                <span>URL:</span>
                <a href={"http://"+score.url} target="_blank">{this.state.selected}</a><br/>
                <div>Visits: {score.visits}</div>
               {score.lastVisitTime != null &&<div>Last Time Visit: {score.lastVisitTime}</div>}
                <div>Trustworthiness: {score.trustworthiness.reputation}</div>
                <div>Child Safety: {score.childSafety.reputation}</div>
                <div>Risks: {this.state.selectedRisk}</div>
            </aside>);
    }
    componentDidMount() {
        if(Object.keys(this.state.input).length != 0) {
            fetch("https://infinite-peak-34901.herokuapp.com/scores", {
                headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
                method: "PUT", body: JSON.stringify(this.state.input)
            }).then((res) => {
                return res.json()
            }).then((json) => {
                console.log(json);
                this.setState({input:this.state.input,output:json});
            });
        }
    }
    getSelected(){
        var x = document.getElementById("resultSelection");
        let risks = [];
        if(this.state.output.scores[x.value].categories != null)
            risks = Object.keys(this.state.output.scores[x.value].categories);
        //console.log(risks);
        let riskString = "";
        for(let r of risks)
            riskString = riskString+r+',';
        //console.log(riskString);
        fetch("https://infinite-peak-34901.herokuapp.com/convertRisks/?risks="+riskString,{
            headers: {'Accept': 'application/json','Content-Type': 'application/json'},
            method: "GET"}).then((res)=>{return res.json()}).then((res)=>{
            //console.log(res);
            let riskString = "";
            for(let i of res.risks)
                riskString += i+", ";
            if(res.risks.length!= 0)
                riskString = riskString.substring(0,riskString.length-2);
            else
                riskString = "None Found";
            this.setState({selected:x.value,selectedRisk:riskString});
            //
        });
    }
    render() {
        return (<div>
            {this.renderBrowsingScore()}
            <div className="row align-items-start">
                <div className="col-sm-6">
                    <select multiple id="resultSelection" onClick={()=>{this.getSelected()}}>
                        {Object.keys(this.state.output.scores).map((key)=>{
                            return(
                                <option key={key} value={key}>
                                    {key}  Score: {this.state.output.scores[key].trustworthiness.reputation}<span class="badge">Score: {this.state.output.scores[key].trustworthiness.reputation}</span>
                                </option>)})}
                    </select>
                </div>
                <div className="col-sm">
                    {this.renderSelectedScore()}
                </div>
            </div>
        </div>);
    }
}

export default ScoreView;
