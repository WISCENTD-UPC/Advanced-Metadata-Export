import React from 'react';
import ReactDOM from 'react-dom';
import App from "./App.js"
import './index.css';
import {
    init
} from "d2/lib/d2";

import { initHeaderBar } from 'd2-ui/lib/app-header';


const initConfig = {
    baseUrl: "http://dhis.academy/dhis/api"
};
init(initConfig)
    .then(d2 => {
        initHeaderBar(
            document.getElementById('header-bar'),
            initConfig.baseUrl,
        );
        ReactDOM.render(<App d2={d2}/>, document.getElementById('root'));
    });