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
               <button onClick={()=>{this.move("history",{})}}>Score My History</button>
               <ScoreSite/>
               <WebRanking/>

           </div>);
    }
}

export default HomeView;
