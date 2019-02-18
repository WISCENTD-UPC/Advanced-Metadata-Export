import _ from 'lodash';

import {
    GRID_ADD_DEPENDENCIES,
    GRID_ADD_METADATA,
    GRID_REMOVE_FROM_SELECTION,
    GRID_STATE_CHANGE
} from '../actions/actionTypes';
import {gridInitialState} from '../actions/gridAction';
import {Extractor} from "../logic/extractor";

const grid = (state = gridInitialState, action) => {
    let newState = {...state};
    switch (action.type) {
        case GRID_STATE_CHANGE:
            if (action.partialStateName === 'selection') {
                newState.selectionAsIndeterminate = _.difference(state.selectionAsIndeterminate,
                    _.difference(state.selection, action.partialStateValue));
                Extractor.getInstance().initialFetchAndRetrieve(
                    _.difference(action.partialStateValue, state.selection));
            }
            return {
                ...newState,
                [action.partialStateName]: action.partialStateValue,
            };
        case GRID_ADD_METADATA:
            newState.rows = _.uniq(newState.rows.concat(...action.metadata));
            return newState;
        case GRID_ADD_DEPENDENCIES:
            newState.selectionAsIndeterminate = _.uniq(newState.selectionAsIndeterminate.concat(...action.dependencies));
            return newState;
        case GRID_REMOVE_FROM_SELECTION:
            newState.selection = _.difference(state.selection, [action.id]);
            newState.selectionAsIndeterminate = _.difference(state.selectionAsIndeterminate, [action.id]);
            return newState;
        default:
            return newState;
    }
};

export default grid;