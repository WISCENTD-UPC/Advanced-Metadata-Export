import React from "react";
import ReactJson from 'react-json-view';

import Dialog from "@material-ui/core/Dialog/Dialog";

export default class JsonDialog extends React.Component {
    handleClose = () => {
        this.props.onClose();
    };

    render() {
        const {json, ...other} = this.props;

        return (
            <Dialog fullWidth={true} maxWidth={"md"} onClose={this.handleClose} {...other}>
                <div style={{margin: "2em"}}>
                    <ReactJson src={json}/>
                </div>
            </Dialog>
        );
    }
}