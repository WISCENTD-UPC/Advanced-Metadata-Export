import _ from 'lodash';

import {GRID_ADD_DEPENDENCIES, GRID_ADD_METADATA, GRID_STATE_CHANGE_ACTION} from '../actions/actionTypes';
import {gridInitialState} from '../actions/gridAction';
import * as extractor from "../logic/extractor";

const grid = (state = gridInitialState, action) => {
    let newState = {...state};
    switch (action.type) {
        case GRID_STATE_CHANGE_ACTION:
            if (action.partialStateName === 'selection') {
                extractor.initialFetchAndRetrieve({
                    d2: action.d2,
                    database: action.database
                }, _.difference(action.partialStateValue, state.selection));
            }
            return {
                ...state,
                [action.partialStateName]: action.partialStateValue,
            };
        case GRID_ADD_METADATA:
            newState.rows = _.uniq(newState.rows.concat(...action.metadata));
            return newState;
        case GRID_ADD_DEPENDENCIES:
            newState.selectionAsIndeterminate = _.uniq(newState.selectionAsIndeterminate.concat(...action.dependencies));
            return newState;
        default:
            return newState;
    }
};

export default grid;