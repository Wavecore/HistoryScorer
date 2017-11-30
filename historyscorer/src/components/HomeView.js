import React, { Component } from 'react';
import WebRanking from './WebRanking';
import ScoreSite from './scoreSite';

class HomeView extends Component {
    constructor(props){
        super(props);
        this.move = props.move;
    }
    render() {
        //Should Render
       return (
           <div>
               <div className="row align-items-start">
                   <div className="col-sm-8">
                       <button onClick={()=>{this.move("history",{})}}>Score My History</button>
                       <div>&nbsp;</div>
                       <div> &nbsp;</div>
                       <ScoreSite/>
                   </div>
                   <div className="col-sm">
                       <WebRanking/>
                   </div>
               </div>
           </div>);
    }
}

export default HomeView;
