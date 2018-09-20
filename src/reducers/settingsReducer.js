import * as actionTypes from "../actions/actionTypes";
import * as settingsAction from "../actions/settingsAction";

const settings = (state = settingsAction.defaultSettingsState, action) => {
    let newState = {...state};
    switch (action.type) {
        case actionTypes.SETTINGS_ORG_UNIT_CHILDREN:
        case actionTypes.SETTINGS_USER_CLEAN_UP:
            newState[action.type] = action.value;
            return newState;
        default:
            return newState;
    }
};

export default settings;