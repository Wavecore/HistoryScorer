import React, { Component } from 'react';
import logo from '../logo.svg';
import WebRanking from './WebRanking';

class HomeView extends Component {
    constructor(props){
        super(props);
        this.move = props.move;
    }
    render() {
       return (
           <div>
               <button onClick={()=>{this.move("history",{})}}>Score My History</button>
               <WebRanking/>
           </div>);
    }
}

export default HomeView;
