import React from 'react';
import _ from 'lodash';
import * as FileSaver from "file-saver";
import PropTypes from 'prop-types';

import HeaderBarComponent from 'd2-ui/lib/app-header/HeaderBar';
import headerBarStore$ from 'd2-ui/lib/app-header/headerBar.store';
import withStateFrom from 'd2-ui/lib/component-helpers/withStateFrom';
import LoadingMask from "d2-ui/lib/loading-mask/LoadingMask.component";

import CircularProgress from 'material-ui/CircularProgress';
import RaisedButton from 'material-ui/RaisedButton/RaisedButton';

import "./App.css";
import * as extractor from "../logic/extractor";
import theme from "../theme";
import {MuiThemeProvider} from "material-ui";

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

const HeaderBar = withStateFrom(headerBarStore$, HeaderBarComponent);

class App extends React.Component {
    getChildContext() {
        return {
            d2: this.state.d2,
        };
    }

    constructor(props) {
        super(props);
        this.state = {
            loader: "none",
            d2: this.props.d2,
            database: this.props.database,
            currentMetadataType: "",
            metadata: [],
            selectedMetadata: [],
            isLoading: false
        }
    }

    handleSelectorChange = (event) => {
        let metadataType = event.target.value;
        if (metadataType === "") {
            this.setState({
                currentMetadataType: "",
                metadata: []
            });
            return;
        }
        this.setState({
            loader: "block",
            metadata: []
        });
        let metadata = [];
        this.state.d2.models[metadataType].list({paging: false, fields: ['id', 'name']}).then(result => {
            result.toArray().forEach(object => {
                let already = _.findIndex(this.state.selectedMetadata, element => {
                    return element.id === object.id;
                });
                if (already === -1) {
                    metadata.push(object);
                }
            });
            this.setState({
                loader: "none",
                currentMetadataType: metadataType,
                metadata: metadata
            });
        });
    };

    handleFilterChange = (event) => {
        let currentMetadataType = this.state.currentMetadataType;
        let filterParam = event.target.value;
        if (this.state.currentMetadataType === "") {
            return;
        }

        let options = {paging: false, fields: ['id', 'name']};
        if (filterParam !== "") {
            options.filter = `name:ilike:${filterParam}`;
        }

        this.state.d2.models[currentMetadataType].list(options)
            .then(result => {
                this.setState({
                    metadata: result.toArray()
                })
            })
    };

    handleAddMetadata = (index) => (event) => {
        let metadata = this.state.metadata;
        let selectedMetadata = this.state.selectedMetadata;
        let metadataType = this.state.currentMetadataType;
        let object = metadata.splice(index, 1)[0];
        object.metadataType = metadataType;
        selectedMetadata.push(object);

        extractor.initialFetchAndRetrieve({
            d2: this.state.d2,
            database: this.state.database,
            id: object.id,
            type: metadataType
        });

        this.setState({
            metadata: metadata,
            selectedMetadata: selectedMetadata
        });
    };

    handleRemoveMetadata = (index) => () => {
        /** TODO: We should remove from database recursively
        let metadata = this.state.metadata;
        let selectedMetadata = this.state.selectedMetadata;
        let object = selectedMetadata.splice(index, 1)[0];
        metadata.push(object);
        this.setState({
            metadata: metadata,
            selectedMetadata: selectedMetadata
        });
        **/
    };

    handleCreatePackage = (event) => {
        this.setState({
            isLoading: true
        });
        extractor.createPackage({
            d2: this.state.d2,
            database: this.state.database
        }, this.state.selectedMetadata)
            .then((result) => {
                FileSaver.saveAs(new Blob([JSON.stringify(result, null, 4)], {
                    type: 'application/json',
                    name: 'extraction.json'
                }), 'extraction.json');
                this.setState({
                    isLoading: false
                });
            });
    };

    render() {
        return (
            <MuiThemeProvider muiTheme={theme}>
                <div>
                    <div hidden={!this.state.isLoading} style={{position: 'fixed',
                        top:0,
                        bottom:0,
                        left:0,
                        right:0,
                        backgroundColor: '#F1F1F1',
                        opacity:0.8,
                        zIndex:1001}}>
                        <LoadingMask large={true}/>
                    </div>
                    <HeaderBar d2={this.state.d2}/>
                    <div id="metadata-type-selector">
                        <div>Please select metadata type:</div>
                        <div>
                            <select onChange={this.handleSelectorChange}>
                                <option value="">Select metadata type</option>
                                {
                                    _.sortBy(_.uniq(Object.keys(this.state.d2.models).filter(model => {
                                        return (this.state.d2.models[model].isMetaData);
                                    }).map(model => {
                                        return this.state.d2.models[model].name
                                    }))).map((model, index) => {
                                        return <option key={index}
                                                       value={this.state.d2.models[model].name}>{this.state.d2.models[model].displayName}</option>
                                    })
                                }
                            </select>
                        </div>
                    </div>
                    <div id="metadata-name-filter-container">
                        <div>Search:</div>
                        <div><input type="text" d="metadata-name-filter" onChange={this.handleFilterChange}/></div>
                    </div>
                    <div id="metadata-table-container">
                        <div id="metadata-table">

                            <div className="metadata-table-header-container">
                                <div className="metadata-table-id-col">UID</div>
                                <div className="metadata-table-name-col">Name</div>
                            </div>
                            <CircularProgress size={50} style={{display: this.state.loader}}/>
                            {
                                this.state.metadata.map((element, index) => {
                                    return (
                                        <div className="metadata-table-row-container"
                                             onClick={this.handleAddMetadata(index)}>
                                            <div className="metadata-table-id-col">{element.id}</div>
                                            <div className="metadata-table-name-col">{element.name}</div>
                                        </div>

                                    )
                                })
                            }

                        </div>
                        <div id="selected-metadata-container">
                            <div id="selected-metadata-table">
                                <div className="selected-metadata-table-header-container">
                                    <div className="selected-metadata-table-id-col">UID</div>
                                    <div className="selected-metadata-table-name-col">Name</div>
                                    <div className="selected-metadata-table-type-col">Type</div>
                                </div>
                                {
                                    this.state.selectedMetadata.map((element, index) => {
                                        return (
                                            <div className="selected-metadata-table-row-container"
                                                 onClick={this.handleRemoveMetadata(index)}>
                                                <div className="selected-metadata-table-id-col">{element.id}</div>
                                                <div className="selected-metadata-table-name-col">{element.name}</div>
                                                <div
                                                    className="selected-metadata-table-type-col">{element.metadataType}</div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            <RaisedButton color="primary" onClick={this.handleCreatePackage}>
                                SUBMIT
                            </RaisedButton>
                        </div>
                    </div>
                </div>
            </MuiThemeProvider>
        );
    }
}

App.childContextTypes = {
    d2: PropTypes.object,
};

export default App;