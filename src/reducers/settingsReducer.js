import * as actionTypes from "../actions/actionTypes";
import * as settingsAction from "../actions/settingsAction";

const settings = (state = {
    SETTINGS_ORG_UNIT_CHILDREN: settingsAction.ORG_UNIT_CHILDREN_ASSUME_OPTION,
    SETTINGS_USER_CLEAN_UP: settingsAction.USER_CLEAN_UP_KEEP_OPTION
}, action) => {
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