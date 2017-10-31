import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Nav from './components/Nav';
import WebRanking from './components/WebRanking';
import registerServiceWorker from './registerServiceWorker';


ReactDOM.render(<Nav />, document.getElementById('nav'));
ReactDOM.render(<WebRanking />, document.getElementById('user_score'));
registerServiceWorker();
