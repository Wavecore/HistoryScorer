import React, { Component } from 'react';

class BrowsingScore extends Component {
    constructor(props){
        super(props);
        this.state = {browsingScore:props.browsingScore,risks:props.risks};
    }
    render() {

        console.log("Props");
        console.log(this.props);
        console.log("State");
        console.log(this.state);
        let riskString = "";
        for(let i of this.state.risks)
            riskString += i+",";
        if(this.state.risks.length!= 0)
            riskString = riskString.substring(0,riskString.length-1);
        else
            riskString = "None Found";

        return (<div>
            <div>Browsing Score: {this.state.browsingScore}</div>
            <div>Risks: {riskString}</div>
        </div>);
    }
}

export default BrowsingScore;
