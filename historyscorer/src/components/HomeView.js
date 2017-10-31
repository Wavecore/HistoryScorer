import React, { Component } from 'react';
import logo from '../logo.svg';
import WebRanking from './WebRanking';

class HomeView extends Component {
    constructor(props){
        super(props);
        this.state = {view:"home",data:{}};
    }
    render() {
       return (<WebRanking/>);
    }
}

export default HomeView;
