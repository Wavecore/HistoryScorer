import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from "./components/App";
import registerServiceWorker from './registerServiceWorker';
//require('bootstrap');
ReactDOM.render(<App />, document.getElementById('app'));
registerServiceWorker();
