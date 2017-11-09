import React, { Component } from 'react';
import './App.css';
import Nav from './Nav';
import HomeView from './HomeView';
import HistoryView from './HistoryView';
import ScoreView from './ScoreView';

import {
    BrowserRouter as Router,
    Route,Redirect, Switch,Link
} from 'react-router-dom'

class App extends Component {
    constructor(props){
        super(props);
        this.state = {view:"home",data:{}};
        this.home=()=>{
            return (<HomeView move={(view,value)=>{this.movePage(view,value)}}/>);
        };
        this.history=()=>{
            return (<HistoryView move={(view,value)=>{this.movePage(view,value)}}/>);
        };
        this.score=()=>{
            return (<ScoreView value= {this.state.data} move={(view,value)=>{this.movePage(view,value)}}/>);
        };
        this.notFound = ()=>{
            return (<div>404 Page not found</div>) ;
        };
    }
    movePage(nextView,value){
        //console.log("nextView = "+nextView);
      //  console.log(value);
        this.setState({view:nextView,data:value})

    }


    render() {
        /*
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
                */
       return( <Router>
            <div>
                <Link to="/">Home</Link>
                <Link to="/history">History</Link>
                <Link to="/score">Score</Link>
                <a href="http://www.mywot.com"><img src="https://cdn-cf.mywot.net/files/friendbadges/friend_medium.png" alt="Friend of WOT" /></a>

                <hr/>
                <Switch>
                    <Route exact path="/" component={this.home}/>
                    <Route exact path="/home" component={this.home}/>
                    <Route path="/history" component={this.history}/>
                    <Route path="/score" component={this.score}/>
                    <Route  component={this.notFound}/>
                </Switch>
                <Redirect exact to={"/"+this.state.view}/>
            </div>
        </Router>);
  }
}

export default App;
