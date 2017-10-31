import React, { Component } from 'react';
import logo from '../logo.svg';
import WebRanking from './WebRanking';

class HistoryView extends Component {
    constructor(props){
        super(props);
        this.move = props.move;
        this.state = {};
        this.state.selected = null;
        this.state.input = props.value;
        this.state.history = {};
    }
    renderSelectedHistory(){
        if(this.state.selected == null) return(<td></td>);
        let historyEntry = this.state.history[this.state.selected];
        return(
            <aside>
                <div>{this.state.selected}</div>
                <span>URL:</span>
                <a href={"http://"+historyEntry.url} target="_blank">{this.state.selected}</a><br/>
                <div>Visits: {historyEntry.visits}</div>
                {()=>{if(historyEntry.lastVisitTime != null){return(<div>Last Time Visit: {historyEntry.lastVisitTime}</div>);}}}
                <button onClick={()=>{this.deleteSelected()}}>
                    Delete
                </button>
            </aside>);
    }
    getHostName(url) {
        if(this.isValidURL(url)){
            let hostName = url;
            hostName = hostName.replace(new RegExp('^((https?:)?\/\/)'),"");
            hostName = hostName.replace(new RegExp('^www[0-9]*\\.'),"");
            hostName = hostName.replace(new RegExp('\/.*'),"");
            hostName = hostName.replace(new RegExp(' '),"");
            //console.log(hostName);
            if(this.isValidURL(hostName))
                return hostName;
            else
                return null;
        }
        else
            return null;
    }
    isValidURL(str) {
        var pattern = new RegExp('^((https?:)?\\/\\/)?'+ // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
            '(\\#[-a-z\\d_]*)?$','i'); // fragment locater
        if (!pattern.test(str)) {
            return false;
        } else {
            return true;
        }
    }
    getSelected(){
        var selector = document.getElementById("historySelection");
        this.setState({selected:selector.value});
    }
    deleteSelected(){
        var selector = document.getElementById("historySelection");
        let copy = JSON.parse(JSON.stringify(this.state.history));
        delete copy[selector.value];
        this.setState({history:copy});
    }
    loadJSON(){

    }
    addWebsite(){
        var newWebsite = document.getElementById("txtAddWebsite");
        let hostName = this.getHostName(newWebsite.value);
        if(hostName != null){
            let copy = JSON.parse(JSON.stringify(this.state.history));
            if(copy[hostName] != null)
                copy[hostName].visits++;
            else
                copy[hostName] = {url:hostName,visits:1};
            this.setState({history:copy});
        }
    }
    render() {
        return (<div>
            <input type="button" value="Load History" onClick={()=>{this.loadJSON()}}/>
            <input id="fileInput" type="file" accept=".json" /><br/>
            <input type="button" value="Add" onClick={()=>{this.addWebsite()}}/>
            <input id="txtAddWebsite" type="text" placeholder="Enter site" /><br/>
            <select multiple id="historySelection" onClick={()=>{this.getSelected()}}>
                {Object.keys(this.state.history).map((key)=>{
                    return(<option key={key} value={key}> {key}</option>)
                })}
            </select>
            <button onClick={()=>{this.move("score",this.state.history)}}>Score My History</button>
            {this.renderSelectedHistory()}

        </div>);
    }
}

export default HistoryView;
