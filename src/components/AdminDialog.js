import React from 'react';
import _ from "lodash";
import {connect} from "react-redux";
import {Grid, TableSelection, Toolbar, VirtualTable} from '@devexpress/dx-react-grid-material-ui';
import {Template, TemplatePlaceholder} from '@devexpress/dx-react-core';

import Spacer from './Spacer';
import Dialog from "@material-ui/core/Dialog/Dialog";
import Select from "react-select";
import Button from "@material-ui/core/Button/Button";
import {IntegratedSelection, SelectionState} from "@devexpress/dx-react-grid";
import {store} from "../store";
import * as actionTypes from "../actions/actionTypes";
import {getBlacklistFromServer} from "../actions/blacklistAction";
import {defaultBlacklist, namespaceName} from "../logic/configuration";

class AdminDialog extends React.PureComponent {
    getRowId = row => row.name;

    constructor(props) {
        super(props);

        this.state = {
            rows: [],
            selection: [],
            metadataType: undefined
        };

        getBlacklistFromServer(store.dispatch, this.props.d2);

        this.onMetadataTypeChange = this.onMetadataTypeChange.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
    }

    loadSelection = () => {

    };

    handleClose = () => {
        this.props.onClose();
    };

    onMetadataTypeChange = (metadataType) => {
        let rows = Object.keys(this.props.d2.models[metadataType.value].modelValidations).filter(validation => {
            let validationRule = this.props.d2.models[metadataType.value].modelValidations[validation];
            let isReference = (validationRule.type === 'COLLECTION' && validationRule.referenceType !== undefined) ||
                validationRule.type === 'REFERENCE';
            return isReference && this.props.d2.models[validation] !== undefined;
        }).map(name => {
            return {name: name};
        });
        this.setState({
            metadataType: metadataType,
            rows: rows,
            selection: this.props.blacklist[metadataType.value]
        });
    };

    onSelectionChange = (selection) => {
        let newSelection = {
            ...this.props.blacklist
        };
        newSelection[this.state.metadataType.value] = selection;
        this.setState({selection});
        store.dispatch({type: actionTypes.UPDATE_USER_BLACKLIST, blacklist: newSelection});
    };

    render() {
        let metadataTypes = _.uniq(Object.keys(this.props.d2.models).filter(model => {
            return this.props.d2.models[model].isMetaData;
        }).map(model => {
            return this.props.d2.models[model].name;
        })).sort().map(elementName => {
            let element = this.props.d2.models[elementName];
            return {value: element.name, label: element.displayName};
        });

        const columns = [{
            name: 'name',
            title: 'Name'
        }];

        const {...other} = this.props;

        let saveBlacklist = () => {
            let blackListName = window.prompt('Insert blacklist name to store');
            this.props.d2.dataStore.has(namespaceName).then(exists => {
                if (!exists) {
                    this.props.d2.dataStore.create(namespaceName).then(namespace => {
                        namespace.set(blackListName, this.props.blacklist);
                    });
                } else {
                    this.props.d2.dataStore.get(namespaceName).then(namespace => {
                        if (namespace.keys.includes(blackListName)) {
                            let overwrite = window.confirm('Blacklist with name ' + blackListName + ' already exists. Overwrite?');
                            if (overwrite) namespace.set(blackListName, this.props.blacklist);
                        } else namespace.set(blackListName, this.props.blacklist);
                    });
                }
            });
        };

        let loadBlacklist = () => {
            let blackListName = window.prompt('Insert blacklist name to load');
            this.props.d2.dataStore.has(namespaceName).then(exists => {
                if (!exists) {
                    this.props.d2.dataStore.create(namespaceName).then(namespace => {
                        window.alert('Blacklist ' + blackListName + ' does not exist');
                    });
                } else {
                    this.props.d2.dataStore.get(namespaceName).then(namespace => {
                        if (namespace.keys.includes(blackListName)) {
                            namespace.get(blackListName).then(newBlacklist => {
                                store.dispatch({type: actionTypes.UPDATE_USER_BLACKLIST, blacklist: newBlacklist});
                                if (this.state.metadataType !== undefined && newBlacklist[this.state.metadataType.value] !== undefined)
                                    this.setState({selection: newBlacklist[this.state.metadataType.value]});
                                else this.setState({selection: []});
                            });
                        } else window.alert('Blacklist ' + blackListName + ' does not exist')
                    });
                }
            });
        };

        let loadDefaultBlacklist = () => {
            store.dispatch({type: actionTypes.UPDATE_USER_BLACKLIST, blacklist: defaultBlacklist});
            if (this.state.metadataType !== undefined && defaultBlacklist[this.state.metadataType.value] !== undefined)
                this.setState({selection: defaultBlacklist[this.state.metadataType.value]});
            else this.setState({selection: []});
        };

        return (
            <Dialog fullWidth={true} maxWidth={"md"} onClose={this.handleClose} {...other}>
                <Grid
                    rows={this.state.rows}
                    columns={columns}
                    getRowId={this.getRowId}
                >
                    <SelectionState
                        selection={this.state.selection}
                        onSelectionChange={this.onSelectionChange}
                    />

                    <IntegratedSelection/>

                    <VirtualTable/>

                    <TableSelection
                        selectByRowClick
                    />

                    <Toolbar/>
                    <Template
                        name="toolbarContent"
                    >
                        <TemplatePlaceholder/>
                        <Button onClick={saveBlacklist}>
                            Save
                        </Button>
                        <Button onClick={loadBlacklist}>
                            Load
                        </Button>
                        <Button onClick={loadDefaultBlacklist}>
                            Default
                        </Button>
                        <Spacer grow='1'/>
                        <div style={{width: '50%'}}>
                            <Select
                                placeholder={'Select metadata type...'}
                                onChange={this.onMetadataTypeChange}
                                options={metadataTypes}
                                value={this.state.metadataType}
                            />
                        </div>
                    </Template>
                </Grid>
            </Dialog>
        );
    }
}

const mapStateToProps = state => ({
    blacklist: state.blacklist,
    d2: state.d2
});

const mapDispatchToProps = dispatch => ({
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AdminDialog);