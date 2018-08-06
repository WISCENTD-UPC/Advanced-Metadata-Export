import React from 'react';
import {connect} from 'react-redux';
import Dialog from '@material-ui/core/Dialog/Dialog';
import List from '@material-ui/core/List/List';
import ListItem from '@material-ui/core/ListItem/ListItem';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import Divider from '@material-ui/core/Divider/Divider';

import {optionDialogValues} from '../actions/settingsAction';

class OptionsDialog extends React.Component {
    handleClose = () => {
        this.props.onClose();
    };

    handleClickListItem = item => {
        let index = item.options.findIndex(e => e.key === this.props.settings[item.key]);
        this.props.changeSettings(item.key, item.options[(index + 1)%item.options.length].key);
    };

    render() {
        const {...other} = this.props;

        return (
            <Dialog fullWidth={true} maxWidth={"md"} onClose={this.handleClose} {...other}>
                <List>
                    {optionDialogValues.map(listItem => (
                        <div key={listItem.key}>
                            <ListItem button aria-label={listItem.value} onClick={() => this.handleClickListItem(listItem)}>
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

const mapDispatchToProps = dispatch => ({
    changeSettings: (name, value) => dispatch({type: name, value: value})
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(OptionsDialog);