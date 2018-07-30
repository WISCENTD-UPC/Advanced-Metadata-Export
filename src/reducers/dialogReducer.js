import * as actionTypes from "../actions/actionTypes";

const dialog = (state = {dialogOpen: false, snackbarOpen: false, snackbarMessage: '', dialogJson: ''}, action) => {
    let newState = {...state};
    switch (action.type) {
        case actionTypes.DIALOG_JSON_UPDATE:
            newState.dialogJson = action.json;
            return newState;
        case actionTypes.DIALOG_JSON_SHOW:
            newState.dialogOpen = action.show;
            return newState;
        case actionTypes.SNACKBAR_UPDATE:
            newState.snackbarMessage = action.message;
            return newState;
        case actionTypes.SNACKBAR_SHOW:
            newState.snackbarOpen = action.show;
            return newState;
        default:
            return newState;
    }
};

export default dialog;