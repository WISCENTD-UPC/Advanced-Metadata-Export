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
            metadataType: {
                rows: []
            }
        };

        getBlacklistFromServer(store.dispatch, this.props.d2);

        this.onMetadataTypeChange = this.onMetadataTypeChange.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
    }

    metadataTypes = _(this.props.d2.models)
        .keys()
        .filter(model => {
            return this.props.d2.models[model].isMetaData;
        })
        .map(model => {
            return this.props.d2.models[model].name;
        })
        .uniq()
        .sort()
        .map(elementName => {
            const {models} = this.props.d2;
            let rows = _(models[elementName].modelValidations)
            .keys()
            .filter(validation => {
                let validationRule = models[elementName].modelValidations[validation];
                let isReference = (validationRule.type === 'COLLECTION' && validationRule.referenceType !== undefined) ||
                    validationRule.type === 'REFERENCE';
                return isReference && models[validation] && validation !== "user";
            })
            .map(name => {
                let model = models[name];
                return { name: model.name };
            })
            .uniqBy('name')
            .value();

            let element = models[elementName];
            return {value: element.name, label: element.displayName, rows};
        })
        .filter(element => element.rows.length > 0);

    handleClose = () => {
        this.props.onClose();
    };

    onMetadataTypeChange = (metadataType) => {
        this.setState({
            metadataType: metadataType,
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

    saveBlacklist = () => {
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

    loadBlacklist = () => {
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

    loadDefaultBlacklist = () => {
        const {metadataType} = this.state;
        let selection = [];
        if (metadataType !== undefined && defaultBlacklist[metadataType.value] !== undefined) {
            selection = defaultBlacklist[metadataType.value];
        }
        this.setState({selection});
        store.dispatch({type: actionTypes.UPDATE_USER_BLACKLIST, blacklist: defaultBlacklist});
    };

    render() {
        const {selection, metadataType} = this.state;
        const {...other} = this.props;
        const columns = [{
            name: 'name',
            title: 'Name'
        }];

        console.log(metadataType)

        return (
            <Dialog fullWidth={true} maxWidth={"md"} onClose={this.handleClose} {...other}>
                <Grid
                    rows={metadataType.rows}
                    columns={columns}
                    getRowId={this.getRowId}
                >
                    <SelectionState
                        selection={selection}
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
                        <Button onClick={this.saveBlacklist}>
                            Save
                        </Button>
                        <Button onClick={this.loadBlacklist}>
                            Load
                        </Button>
                        <Button onClick={this.loadDefaultBlacklist}>
                            Default
                        </Button>
                        <Spacer grow='1'/>
                        <div style={{width: '50%'}}>
                            <Select
                                placeholder={'Select metadata type...'}
                                onChange={this.onMetadataTypeChange}
                                options={this.metadataTypes}
                                value={metadataType}
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