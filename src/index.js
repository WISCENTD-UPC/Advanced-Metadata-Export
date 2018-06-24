import React from 'react';
import ReactDOM from 'react-dom';
import {init} from 'd2/lib/d2';

import App from './components/App.js'
import './index.css';

let config = {};

if (process.env.REACT_APP_DHIS2_URL !== undefined) {
    config.baseUrl = process.env.REACT_APP_DHIS2_URL;
    config.headers = {
        Authorization: "Basic " + btoa(process.env.REACT_APP_DHIS2_USERNAME + ':' + process.env.REACT_APP_DHIS2_PASSWORD)
    }
}

init(config).then(d2 => {
    console.log(d2);
    ReactDOM.render(<App d2={d2}/>, document.getElementById('root'));
});