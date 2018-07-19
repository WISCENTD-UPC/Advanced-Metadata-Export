import React from 'react';
import ReactDOM from 'react-dom';
import PouchDB from 'pouchdb';
import * as D2Library from "d2/lib/d2";
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import App from './components/App.js';
import './index.css';
import theme from './theme';

D2Library.getManifest('manifest.webapp').then((manifest) => {
    let config = {};

    // Set baseUrl
    config.baseUrl = manifest.activities.dhis.href !== undefined ? manifest.activities.dhis.href
        : process.env.REACT_APP_DHIS2_BASE_URL !== undefined ? process.env.REACT_APP_DHIS2_BASE_URL
            : config.baseUrl = window.location.href.includes('/api') ? window.location.href.split('/api')[0] + '/api'
                : undefined;

    // Set credentials
    if (process.env.REACT_APP_DEBUG === 'true') {
        console.log('Starting React App in DEBUG mode with user: ' + process.env.REACT_APP_DHIS2_USERNAME);
        config.headers = {
            Authorization: "Basic " + btoa(process.env.REACT_APP_DHIS2_USERNAME + ':' + process.env.REACT_APP_DHIS2_PASSWORD)
        }
    }

    // Init library
    D2Library.init(config).then(d2 => {
        console.log({url: config.baseUrl, d2: d2});
        let database = new PouchDB('exports');
        database.destroy().then(function () {
            database = new PouchDB('exports');
            ReactDOM.render(<App d2={d2} database={database} />, document.getElementById('root'));
        });
    });
}).catch((error) => {
    console.error('D2 initialization error:', error);
    ReactDOM.render((<div>Failed to initialise D2</div>), document.getElementById('root'));
});

ReactDOM.render(<MuiThemeProvider muiTheme={theme}><LoadingMask/></MuiThemeProvider>, document.getElementById('root'));