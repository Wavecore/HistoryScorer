import React, { Component } from 'react';
import "./App.css";

class HistoryView extends Component {
    constructor(props){
        super(props);
        this.move = props.move;
        this.state = {processMsg:null,selected:null,input:props.value,history:{}};
       // this.state.selected = null;
      //  this.state.input = props.value;
       // this.state.history = {};
    }
    renderSelectedHistory(){
        if(this.state.selected == null) return(<span></span>);
        let historyEntry = this.state.history[this.state.selected];

        return(
            <aside>
                <div>{this.state.selected}</div>
                <span>URL:</span>
                <a href={"http://"+historyEntry.url} target="_blank">{this.state.selected}</a><br/>
                <div>Visits: {historyEntry.visitCount}</div>
                {historyEntry.lastVisitTime != null &&<div>Last Time Visit: {historyEntry.lastVisitTime}</div>}
                <button onClick={()=>{this.deleteSelected()}}>
                    Delete
                </button>
            </aside>);
    }
    getHostName(url) {
        if(this.isValidURL(url)){
            let hostName = url;
            hostName = hostName.replace(new RegExp('^((https?:)?//)'),"");
            hostName = hostName.replace(new RegExp('^www[0-9]*\\.'),"");
            hostName = hostName.replace(new RegExp('/.*'),"");
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
        this.setState({history:copy,selected:null});
    }
    json2Dictionary(json){
        let histView = this;
        let history = JSON.parse(JSON.stringify(this.state.history));
        let keys = Object.keys(json);
        let historyEntry;
        keys.forEach(function (key) {
            historyEntry = json[key];
            delete historyEntry.id;
            let webkey =  histView.getHostName(historyEntry.url);
            // console.log(webkey);
            if(webkey != null){
                if(history[webkey] === undefined){
                    history[webkey] = historyEntry;
                    history[webkey].url=webkey;
                }
                else
                {
                    let entry = history[webkey];
                    if(entry.lastVisitTime !== undefined && historyEntry.lastVisitTime !== undefined &&
                        (new Date(entry.lastVisitTime) > new Date(historyEntry.lastVisitTime)))
                        entry.lastVisitTime = historyEntry.lastVisitTime;
                    entry.visitCount = entry.visitCount+historyEntry.visitCount;
                    history[webkey] = entry;
                }
            }
        });
        this.setState({history:history});
    }
    loadJSON(){
        var file = document.getElementById("fileInput").files[0];
        var histView = this;

        var loadHstryBtn = document.getElementById("LoadHistory");
       //var scoreBtn = document.getElementById("scoreHistory");
        //var chsFileBtn = document.getElementById("chsFile");
        //let processMsgString = "Please wait your history is being loaded.";
        //this.setState({processMsg:processMsgString});

        if(file){
            //loadHstryBtn.disabled;
            loadHstryBtn.disabled=true;
            //chsFileBtn.disabled=true;

            var reader = new FileReader();
            reader.readAsText(file,"UTF-8");
            reader.onload = function(evt){
                histView.json2Dictionary(JSON.parse(evt.target.result));
               //evt.target.result);
                file.value = "";
               // scoreBtn.disabled=false;
                //loadHstryBtn.class="btn btn-primary active";
                loadHstryBtn.disabled=false;
                let processMsgString = "Pleased.";
                //this.setState({processMsg:processMsgString});
                //chsFileBtn.disabled=false;

            }
            reader.onerror = function(evt){
                //scoreBtn.disabled=false;
                loadHstryBtn.disabled=false;
                //this.setState({processMsg:null});
                //chsFileBtn.disabled=false;
                console.log("ERROR: Reading file");
            }

        }

    }
    addWebsite(){
        var newWebsite = document.getElementById("txtAddWebsite");
        let hostName = this.getHostName(newWebsite.value);
        newWebsite.value = "";
        if(hostName != null){
            let copy = JSON.parse(JSON.stringify(this.state.history));
            if(copy[hostName] != null)
                copy[hostName].visitCount++;
            else
                copy[hostName] = {url:hostName,visitCount:1};
            this.setState({history:copy});
        }
    }
    render() {
        return (
            <div>
                <label>Step 1) Download and install the <a href="https://chrome.google.com/webstore/detail/history-export/lpmoaclacdaofhlijejogfldmgkdlglj?hl=en"  target="_blank">Chrome History Export</a> from the Chrome Web Store onto your Chrome browser</label><br/>
                <div className="row align-items-start">
                    <div className="col-sm-1"/>
                    <div className="col-sm-15">
                    <label><a href="https://chrome.google.com/webstore/detail/history-export/lpmoaclacdaofhlijejogfldmgkdlglj?hl=en"  target="_blank">https://chrome.google.com/webstore/detail/history-export/lpmoaclacdaofhlijejogfldmgkdlglj?hl=en</a></label>
                    </div>
                </div>
                <label>Step 2) Once the chrome extension has been installed, click the extension at the top of your chrome browser and then click "All History" to download your history as a JSON file</label><br/>
                <div className="row align-items-start">
                    <div className="col-sm-1"/>
                    <div className="col-sm-15">
                        <img src="HistoryExporter.jpg" class="img-rounded"  alt="Chrome History Exporter"/><br/>
                    </div>
                </div>
                <label>Step 3) Load your history by clicking the 'Choose File' button, selecting your history JSON file, and clicking the 'Load History' button</label><br/>
                <input id="fileInput" type="file" accept=".json" />
                <input id="LoadHistory" class="btn btn-primary" type="button" value="Load History" onClick={()=>{this.loadJSON()}}/><br/>
                <label> Or </label><br/>
                <input id="txtAddWebsite" type="text" placeholder="Enter site" />
                <input type="button" value="Add" onClick={()=>{this.addWebsite()}}/><br/>
                <label>Add your websites into your history by entering them into the text box above and clicking the 'Add' button</label><br/>
                <br/><br/>
                {Object.keys(this.state.history).length>0 &&<label htmlFor="loadFile" className="control-label">(Optional) You can click on one of the websites below to bring up more information and edit your history</label>}
                <div className="row align-items-start">
                    <div className="col-sm-6">
                        <select multiple id="historySelection" onClick={()=>{this.getSelected()}}>
                            {Object.keys(this.state.history).map((key)=>{
                                return(<option key={key} value={key}> {key}</option>)
                            })}
                        </select><br/>
                            </div>
                    <div className="col-sm">
                        {this.renderSelectedHistory()}<br/>
                    </div>
                </div><br/>
                <button id="scoreHistory" disabled={Object.keys(this.state.history).length<=0 && "disabled"} onClick={()=>{this.move("score",this.state.history)}}>Score History</button>
            </div>
        );


    }
}

export default HistoryView;
