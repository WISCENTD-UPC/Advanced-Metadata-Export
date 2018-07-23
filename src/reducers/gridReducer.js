import {GRID_ADD_METADATA, GRID_STATE_CHANGE_ACTION} from '../actions/actionTypes';
import {gridInitialState} from '../actions/gridAction';

const grid = (state = gridInitialState, action) => {
    let newState = {...state};
    switch (action.type) {
        case GRID_STATE_CHANGE_ACTION:
            return {
                ...state,
                [action.partialStateName]: action.partialStateValue,
            };
        case GRID_ADD_METADATA:
            newState.rows = newState.rows.concat(...action.metadata);
            return newState;
        default:
            return newState;
    }
};

export default grid;