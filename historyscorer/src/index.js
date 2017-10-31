import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Nav from './Nav';
import WebRanking from './WebRanking';
import ScoreSite from './scoreSite';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Nav />, document.getElementById('root'));
//ReactDOM.render(<WebRanking />, document.getElementById('ranking'));
ReactDOM.render(<ScoreSite />, document.getElementById('siteScore'));

registerServiceWorker();
