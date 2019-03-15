import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import HeaderBar from "@dhis2/d2-ui-header-bar";
import LoadingMask from '@dhis2/d2-ui-core/loading-mask/LoadingMask.component';

import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import {MuiThemeProvider} from "@material-ui/core/styles";
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import Fab from "@material-ui/core/Fab";
import Tooltip from '@material-ui/core/Tooltip/Tooltip';

import MetadataGrid from './MetadataGrid';
import JsonDialog from './JsonDialog';
import './App.css';
import {muiTheme} from "../themes/dhis2.theme";
import muiThemeLegacy from "../themes/dhis2-legacy.theme";
import * as actionTypes from "../actions/actionTypes";
import AlertSnackbar from "./AlertSnackbar";
import OptionsDialog from "./OptionsDialog";
import AdminDialog from "./AdminDialog";
import {Extractor} from "../logic/extractor";

class App extends React.Component {
    getChildContext() {
        return {
            d2: this.props.d2,
        };
    }

    render() {
        const createPackage = () => {
            Extractor.getInstance().attachToExecutor().then(() => {
                Extractor.getInstance().handleCreatePackage(this.props.grid.selection,
                    this.props.grid.selectionAsIndeterminate);
            });
        };

        const {
            jsonDialogOpen, jsonDialogMessage, adminDialogOpen, optionsDialogOpen, snackbarOpen, snackbarMessage
        } = this.props.dialog;

        return (
            <MuiThemeProvider theme={muiTheme}>
                <OldMuiThemeProvider muiTheme={muiThemeLegacy}>
                    <div>
                        <div id="loading" hidden={!this.props.loading}>
                            <LoadingMask large={true}/>
                        </div>
                        <div>
                            <HeaderBar d2={this.props.d2} />
                            <MetadataGrid/>
                        </div>
                        <Tooltip title="Export" placement="top">
                            <Fab id="fab" onClick={createPackage}>
                                <ArrowDownwardIcon style={{color: "white"}}/>
                            </Fab>
                        </Tooltip>
                        <JsonDialog open={jsonDialogOpen} json={jsonDialogMessage} onClose={this.props.hideJsonDialog}/>
                        <AdminDialog open={adminDialogOpen} onClose={this.props.hideAdminDialog}/>
                        <OptionsDialog open={optionsDialogOpen} onClose={this.props.hideOptionsDialog}/>
                        <AlertSnackbar open={snackbarOpen} message={snackbarMessage} onClose={this.props.hideSnackbar}/>
                    </div>
                </OldMuiThemeProvider>
            </MuiThemeProvider>
        );
    }
}

App.childContextTypes = {
    d2: PropTypes.object,
};

const mapStateToProps = state => ({
    loading: state.loading,
    grid: state.grid,
    dialog: state.dialog,
    blacklist: state.blacklist
});

const mapDispatchToProps = dispatch => ({
    hideJsonDialog: () => {
        dispatch({type: actionTypes.DIALOG_JSON_SHOW, show: false});
    },
    hideAdminDialog: () => {
        dispatch({type: actionTypes.DIALOG_ADMIN_SHOW, show: false});
    },
    hideOptionsDialog: () => {
        dispatch({type: actionTypes.DIALOG_OPTIONS_SHOW, show: false});
    },
    hideSnackbar: () => {
        dispatch({type: actionTypes.SNACKBAR_SHOW, show: false});
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);