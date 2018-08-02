import React from 'react';
import {connect} from 'react-redux';

import Dialog from '@material-ui/core/Dialog/Dialog';
import List from '@material-ui/core/List/List';
import ListItem from '@material-ui/core/ListItem/ListItem';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import Divider from '@material-ui/core/Divider/Divider';

import {optionDialogValues} from '../actions/settingsAction';
import Menu from "@material-ui/core/Menu/Menu";

class OptionsDialog extends React.Component {
    handleClose = () => {
        this.props.onClose();
    };

    state = {
        anchorEl: null
    };

    handleClickListItem = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleMenuItemClick = (event, index) => {
        this.setState({ selectedIndex: index, anchorEl: null });
    };

    handleMenuClose = () => {
        this.setState({ anchorEl: null });
    };

    render() {
        const {...other} = this.props;

        return (
            <Dialog fullWidth={true} maxWidth={"md"} onClose={this.handleClose} {...other}>
                <List>
                    {optionDialogValues.map(listItem => (
                        <div key={listItem.key}>
                            <ListItem button aria-label={listItem.value} onClick={this.handleClickListItem}>
                                <ListItemText primary={listItem.value}
                                              secondary={listItem.options.find(e => e.key === this.props.settings[listItem.key]).value}/>
                            </ListItem>
                            <Divider/>
                        </div>
                    ))}
                </List>
            </Dialog>
        );
    }
}

const mapStateToProps = state => ({
    settings: state.settings
});

const mapDispatchToProps = dispatch => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(OptionsDialog);