import React from 'react';
import _ from 'lodash';
import PouchDB from 'pouchdb';

import D2UIApp from '@dhis2/d2-ui-app';
import HeaderBar from '@dhis2/d2-ui-header-bar';
import CircularProgress from '@material-ui/core/CircularProgress';

import "./App.css";
import * as extractor from "../logic/extractor";

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loader: "none",
            d2: this.props.d2,
            database: new PouchDB('exports'),
            currentMetadataType: "",
            metadata: [],
            selectedMetadata: []
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
        this.state.d2.models[metadataType].list({paging: false}).then(result => {
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

        let options = {paging: false};
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
        // Update UI
        let metadata = this.state.metadata;
        let selectedMetadata = this.state.selectedMetadata;
        let metadataType = this.state.currentMetadataType;
        let object = metadata.splice(index, 1)[0];
        object.metadataType = metadataType;
        selectedMetadata.push(object);

        extractor.fetchAndRetrieve({
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
        let metadata = this.state.metadata;
        let selectedMetadata = this.state.selectedMetadata;
        let object = selectedMetadata.splice(index, 1)[0];
        metadata.push(object);
        this.setState({
            metadata: metadata,
            selectedMetadata: selectedMetadata
        });
    };

    render() {
        return (
            <D2UIApp>
                <HeaderBar d2={this.state.d2} />

                <div>
                    <div id="metadata-type-selector">
                        <div>Please select metadata type:</div>
                        <div>
                            <select onChange={this.handleSelectorChange}>
                                <option value="">Select metadata type</option>
                                {
                                    _.sortBy(_.uniq(Object.keys(this.state.d2.models).filter(model => {
                                        return (this.state.d2.models[model].isShareable && this.state.d2.models[model].isMetaData);
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
                                <div className="metadata-table-id-col">Uid</div>
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
                                    <div className="selected-metadata-table-id-col">Uid</div>
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
                        </div>
                    </div>
                </div>
            </D2UIApp>
        );
    }

}