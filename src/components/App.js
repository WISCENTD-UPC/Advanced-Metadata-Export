import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {MuiThemeProvider} from 'material-ui';

import HeaderBarComponent from 'd2-ui/lib/app-header/HeaderBar';
import headerBarStore$ from 'd2-ui/lib/app-header/headerBar.store';
import withStateFrom from 'd2-ui/lib/component-helpers/withStateFrom';
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';

import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import Button from '@material-ui/core/Button/Button';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';

import MetadataGrid from './MetadataGrid';
import JsonDialog from './JsonDialog';
import './App.css';
import theme from './Theme';
import * as extractor from "../logic/extractor";
import * as actionTypes from "../actions/actionTypes";
import AlertSnackbar from "./AlertSnackbar";
import OptionsDialog from "./OptionsDialog";

const HeaderBar = withStateFrom(headerBarStore$, HeaderBarComponent);

class App extends React.Component {
    getChildContext() {
        return {
            d2: this.props.d2,
        };
    }

    render() {
        const createPackage = () => extractor.handleCreatePackage({
            d2: this.props.d2,
            database: this.props.database
        }, _.concat(this.props.grid.selection, ...this.props.grid.selectionAsIndeterminate));

        const {
            jsonDialogOpen, jsonDialogMessage, optionsDialogOpen, optionsDialogMessage, snackbarOpen, snackbarMessage
        } = this.props.dialog;

        return (
            <MuiThemeProvider muiTheme={theme}>
                <div>
                    <div id="loading" hidden={!this.props.loading}>
                        <LoadingMask large={true}/>
                    </div>
                    <div>
                        <HeaderBar d2={this.props.d2}/>
                        <MetadataGrid />
                    </div>
                    <Tooltip title="Export" placement="top">
                        <Button id="fab" variant="fab" onClick={createPackage}>
                            <ArrowDownwardIcon style={{color: "white"}} />
                        </Button>
                    </Tooltip>
                    <JsonDialog open={jsonDialogOpen} json={jsonDialogMessage} onClose={this.props.hideJsonDialog} />
                    <OptionsDialog open={optionsDialogOpen} onClose={this.props.hideOptionsDialog} />
                    <AlertSnackbar open={snackbarOpen} message={snackbarMessage} onClose={this.props.hideSnackbar} />
                </div>
            </MuiThemeProvider>
        );
    }
}

App.childContextTypes = {
    d2: PropTypes.object,
};

const mapStateToProps = state => ({
    d2: state.d2,
    database: state.database,
    loading: state.loading,
    grid: state.grid,
    dialog: state.dialog
});

const mapDispatchToProps = dispatch => ({
    hideJsonDialog: () => {
        dispatch({type: actionTypes.DIALOG_JSON_SHOW, show: false});
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