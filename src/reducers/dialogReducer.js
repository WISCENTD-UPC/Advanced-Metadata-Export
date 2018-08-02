import * as actionTypes from "../actions/actionTypes";

const dialog = (state = {
    optionsDialogOpen: false,
    jsonDialogOpen: false,
    snackbarOpen: false,
    jsonDialogMessage: '',
    snackbarMessage: ''
}, action) => {
    let newState = {...state};
    switch (action.type) {
        case actionTypes.DIALOG_OPTIONS_SHOW:
            newState.optionsDialogOpen = action.show;
            return newState;
        case actionTypes.DIALOG_JSON_UPDATE:
            newState.jsonDialogMessage = action.message;
            return newState;
        case actionTypes.DIALOG_JSON_SHOW:
            newState.jsonDialogOpen = action.show;
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