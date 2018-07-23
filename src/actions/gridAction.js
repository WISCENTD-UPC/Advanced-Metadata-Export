import {GRID_STATE_CHANGE_ACTION} from "./actionTypes";

export const gridInitialState = {
    rows: [],
    columns: [{
        name: 'id',
        title: 'ID'
    }, {
        name: 'name',
        title: 'Name'
    }, {
        name: 'type',
        title: 'Type'
    }],
    sorting: [{ columnName: 'type', direction: 'asc' }],
    grouping: [{columnName: 'type'}],
    expandedGroups: [],
    selection: [],
    expandedRowIds: [],
    filters: [],
    columnOrder: [],
    columnWidths: [],
    totalCount: 0,
    pageSize: 8,
    pageSizes: [5, 8, 16],
    currentPage: 0,
    searchValue: '',
    loading: false
};

export const createGridAction = (partialStateName, partialStateValue) => ({
    type: GRID_STATE_CHANGE_ACTION,
    partialStateName,
    partialStateValue
});