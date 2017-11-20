import React, { Component } from 'react';
import './App.css';
//import Nav from './Nav';
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
        console.log(nextView);
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
        console.log(this.state.view);
       return( <Router>
            <div>
                <nav className="navbar navbar-inverse">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <Link class="navbar-brand" to="/">History Scorer</Link>
                        </div>
                        <ul className="nav navbar-nav">
                            <li><Link to="/">Home</Link></li>
                        </ul>
                        <ul className="nav navbar-nav ml-auto">
                            <li> <a  href="http://www.mywot.com"><img src="https://cdn-cf.mywot.net/files/friendbadges/friend_medium.png" alt="Friend of WOT" /></a></li>
                        </ul>
                    </div>
                </nav>
                <Switch>
                    <Route exact path="/" component={this.home}/>
                    <Route exact path="/home" component={this.home}/>
                    <Route exact path="/history" component={this.history}/>
                    <Route exact path="/score" component={this.score}/>
                    <Route  component={this.notFound}/>
                </Switch>
                <Redirect exact to={"/"+this.state.view}/>
            </div>
        </Router>);
  }
}

export default App;
