import React from 'react';
import ReactDOM from 'react-dom';
import PouchDB from 'pouchdb';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';
import App from './components/App.js';
import './index.css';
import theme from './theme';
import * as D2Library from "d2/lib/d2";

let config = {};

 // Try to gather
 if (process.env.REACT_APP_DHIS2_BASE_URL !== undefined) {
    console.log('Using REACT_APP_DHIS2_BASE_URL');
    config.baseUrl = process.env.REACT_APP_DHIS2_BASE_URL;
} else if (window.location.href.includes('/api')) {
    console.log('Using Window Location HREF');
    config.baseUrl = window.location.href.split('/api')[0] + '/api';
} else {
    console.log('Using default UPC endpoint [WARNING]');
    config.baseUrl = 'http://who-dev.essi.upc.edu:8081/api'
}

 if (process.env.REACT_APP_DEBUG === 'true') {
    console.log('Starting React App in DEBUG mode with user: ' + process.env.REACT_APP_DHIS2_USERNAME);
    config.headers = {
        Authorization: "Basic " + btoa(process.env.REACT_APP_DHIS2_USERNAME + ':' + process.env.REACT_APP_DHIS2_PASSWORD)
    }
} else if (!config.baseUrl) console.error('REACT_APP_DHIS2_BASE_URL is undefined!');

/**D2Library.getManifest('manifest.webapp').then((manifest) => {
    console.log('Attempt: ' + manifest.getBaseUrl() + '/api');
}).then(D2Library.init).then((d2) => {
    console.log({url: config.baseUrl, d2: d2});
    let database = new PouchDB('exports');
    database.destroy().then(function () {
        database = new PouchDB('exports');
        initHeaderBar(
            document.getElementById('header-bar'),
            config.baseUrl,
        );
        ReactDOM.render(<App d2={d2} database={database} />, document.getElementById('root'));
    });
}).catch((error) => {
    console.error('D2 initialization error:', error);
    ReactDOM.render((<div>Failed to initialise D2</div>), document.getElementById('root'));
});**/

D2Library.init(config).then(d2 => {
    console.log({url: config.baseUrl, d2: d2});
    let database = new PouchDB('exports');
    database.destroy().then(function () {
        database = new PouchDB('exports');
        ReactDOM.render(<App d2={d2} database={database} />, document.getElementById('root'));
    });
}).catch((error) => {
    console.error('D2 initialization error:', error);
    ReactDOM.render((<div>Failed to initialise D2</div>), document.getElementById('root'));
});

/**getManifest('./manifest.webapp')
    .then(manifest => {
        const baseUrl = process.env.NODE_ENV === 'production' ? manifest.getBaseUrl() : 'http://who-dev.essi.upc.edu:8081';
        config.baseUrl = `${baseUrl}/api`;
        console.log(`Loading: ${manifest.name} v${manifest.version}`);
        console.log(`Built ${manifest.manifest_generated_at}`);
    })
    .then(getUserSettings)
    .then(init)
    .then(function (d2) {
        let database = new PouchDB('exports');
        database.destroy().then(function () {
            database = new PouchDB('exports');
            ReactDOM.render(<App d2={d2} database={database}/>, document.getElementById('root'));
        });
    })
    .catch((error) => {
        console.error('D2 initialization error:', error);
        ReactDOM.render((<div>Failed to initialise D2</div>), document.getElementById('root'));
    });**/

ReactDOM.render(<MuiThemeProvider muiTheme={theme}><LoadingMask/></MuiThemeProvider>, document.getElementById('root'));