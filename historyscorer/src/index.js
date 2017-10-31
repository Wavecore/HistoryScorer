import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';



/*
import App from './App';
import Nav from './Nav';
import WebRanking from './WebRanking';
import ScoreSite from './scoreSite';
import registerServiceWorker from './registerServiceWorker';
*/
import Nav from './components/Nav';
import WebRanking from './components/WebRanking';
import App from "./components/App";
import registerServiceWorker from './registerServiceWorker';
import ScoreSite from "./components/scoreSite";

ReactDOM.render(<App />, document.getElementById('app'));
registerServiceWorker();
