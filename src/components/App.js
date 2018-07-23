import React from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {MuiThemeProvider} from "material-ui";

import HeaderBarComponent from 'd2-ui/lib/app-header/HeaderBar';
import headerBarStore$ from 'd2-ui/lib/app-header/headerBar.store';
import withStateFrom from 'd2-ui/lib/component-helpers/withStateFrom';
import LoadingMask from "d2-ui/lib/loading-mask/LoadingMask.component";

import MetadataGrid from "./MetadataGrid";
import "./App.css";
import theme from "./Theme";

const HeaderBar = withStateFrom(headerBarStore$, HeaderBarComponent);

class App extends React.Component {
    getChildContext() {
        return {
            d2: this.props.d2,
        };
    }

    render() {
        return (
            <MuiThemeProvider muiTheme={theme}>
                <div>
                    <div id="loading" hidden={!this.props.loading}>
                        <LoadingMask large={true}/>
                    </div>
                    <HeaderBar d2={this.props.d2}/>
                    <div style={{margin: '1em'}}>
                        <MetadataGrid/>
                    </div>
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
    loading: state.loading
});

const mapDispatchToProps = dispatch => ({
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);