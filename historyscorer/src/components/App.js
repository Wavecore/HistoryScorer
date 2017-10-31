import React, { Component } from 'react';
import './App.css';
import Nav from './Nav';
import HomeView from './HomeView';
import HistoryView from './HistoryView';
import ScoreView from './ScoreView';


class App extends Component {
    constructor(props){
        super(props);
        this.state = {view:"home",data:{}};
    }
    movePage(nextView,value){
        console.log("nextView = "+nextView);
        console.log(value);
        this.setState({view:nextView,data:value})
    }
    render() {
       // console.log("renderView: "+this.state.view);
        if(this.state.view === "home")
            return (<div>
                        <Nav move={(view,value)=>{this.movePage(view,value)}}/>
                        <HomeView move={(view,value)=>{this.movePage(view,value)}}/>
                    </div>);
        else if(this.state.view === "history")
            return (<div>
                        <Nav move={(view,value)=>{this.movePage(view,value)}}/>
                        <HistoryView move={(view,value)=>{this.movePage(view,value)}}/>
                    </div>);
        else if(this.state.view === "score")
            return (<div>
                        <Nav move={(view,value)=>{this.movePage(view,value)}}/>
                        <ScoreView value= {this.state.data} move={(view,value)=>{this.movePage(view,value)}}/>
                    </div>);
        return (<div>
                    <Nav move={(view,value)=>{this.movePage(view,value)}}/>
                    <HomeView move={(view,value)=>{this.movePage(view,value)}}/>
                </div>);
  }
}

export default App;
