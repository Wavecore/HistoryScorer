import React, { Component } from 'react';
import logo from '../logo.svg';
import WebRanking from './WebRanking';

class HistoryView extends Component {
    constructor(props){
        super(props);
        this.state = {view:"home",data:{}};
    }
    render() {
        return (<div>History</div>);
    }
}

export default HistoryView;
