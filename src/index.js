import React from 'react';
import ReactDOM from 'react-dom';
import {init} from 'd2/lib/d2';

import App from './components/App.js'
import './index.css';

// TODO: Make production ready
let config = {
    baseUrl: 'http://10.0.75.1:8082/api',
    headers: {
        Authorization: "Basic " + btoa("admin:district"),
    }
};

init(config).then(d2 => {
    console.log(d2);
    ReactDOM.render(<App d2={d2}/>, document.getElementById('root'));
});