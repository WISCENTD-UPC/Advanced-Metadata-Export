import React from 'react';
import ListItem from "@material-ui/core/ListItem/ListItem";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import Divider from "@material-ui/core/Divider/Divider";
import Menu from "@material-ui/core/Menu/Menu";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";

export default class OptionMenuButton extends React.Component {
    state = {
        anchorEl: null
    };

    handleChange = (event, checked) => {
        this.setState({ auth: checked });
    };

    handleMenu = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleClose = () => {
        this.setState({ anchorEl: null });
    };

    render() {
        const { anchorEl } = this.state;
        const open = Boolean(anchorEl);
        const listItems = this.props.items.map((link) =>
            <MenuItem onClick={this.handleClose} >{link}</MenuItem>
        );

        return (
            <div>
                <ListItem button aria-label={listItem.value} onClick={this.handleClickListItem}>
                    <ListItemText primary={listItem.value}
                                  secondary={listItem.options.find(e => e.key === this.props.settings[listItem.key]).value}/>
                </ListItem>
                <Divider/>
                <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={open}
                    onClose={this.handleClose}
                >
                    <MenuItem
                        key={option}
                        disabled={index === 0}
                        selected={index === this.state.selectedIndex}
                        onClick={event => this.handleMenuItemClick(event, index)}
                    >
                        {option}
                    </MenuItem>
                </Menu>
            </div>
        );
    }
}