import * as React from 'react';
import _ from 'lodash';
import {connect} from "react-redux";
import Paper from '@material-ui/core/Paper';
import Button from "@material-ui/core/es/Button/Button";
import Spacer from 'react-spacer';
import {
    GroupingState,
    IntegratedFiltering,
    IntegratedGrouping,
    IntegratedSelection,
    IntegratedSorting,
    SearchState,
    SelectionState,
    SortingState
} from '@devexpress/dx-react-grid';
import {
    Grid,
    SearchPanel,
    TableGroupRow,
    TableHeaderRow,
    TableSelection,
    Toolbar,
    VirtualTable
} from '@devexpress/dx-react-grid-material-ui';
import {Template, TemplatePlaceholder} from '@devexpress/dx-react-core';

import * as extractor from '../logic/extractor';
import {createGridAction} from '../actions/gridAction';
import {TableSelectCell} from './TableSelectCell';
import {TableDeleteCell} from "./TableDeleteCell";
import * as actionTypes from "../actions/actionTypes";


class MetadataGrid extends React.PureComponent {
    constructor(props) {
        super(props);

        this.selectedCell = this.selectedCell.bind(this);
        this.deletedCell = this.deletedCell.bind(this);
    }

    getRowId = row => row.id;

    selectedCell({ row, selected, ...restProps }) {
        const indeterminate = this.props.grid.selectionAsIndeterminate.findIndex(index => this.getRowId(row) === index) !== -1;
        const onDelete = (id) => this.props.grid.selectionAsIndeterminate.clear();
        return (
            <TableSelectCell
                indeterminate={!selected && indeterminate}
                selected={selected}
                onDelete={onDelete}
                {...restProps}
            />
        );
    }

    deletedCell({ row, selected, ...restProps }) {
        const onDelete = () => {
            this.props.removeFromSelection(this.getRowId(row));
        };
        return (
            <TableDeleteCell
                onDelete={onDelete}
                {...restProps}
            />
        );
    }

    render() {
        const {
            rows, columns, selection, searchValue, sorting, grouping, selectionAsIndeterminate
        } = this.props.grid;

        const {
            onSelectionChange, onSearchValueChange, onSelectionClear, onSortingChange, onGroupingChange
        } = this.props;

        const createPackage = () => extractor.handleCreatePackage({
            d2: this.props.d2,
            database: this.props.database
        }, _.concat(selection, ...selectionAsIndeterminate));

        return (
            <div className="main-container" style={{margin: "1em", marginTop: "3em"}}>
                <Paper style={{margin: "1em"}}>
                    <Grid
                        rows={rows}
                        columns={columns}
                        getRowId={this.getRowId}
                    >
                        <SortingState
                            sorting={sorting}
                            onSortingChange={onSortingChange}
                        />
                        <GroupingState
                            grouping={grouping}
                            onGroupingChange={onGroupingChange}
                        />
                        <SelectionState
                            selection={selection}
                            onSelectionChange={onSelectionChange}
                        />
                        <SearchState
                            value={searchValue}
                            onValueChange={onSearchValueChange}
                        />

                        <IntegratedSorting/>
                        <IntegratedGrouping/>
                        <IntegratedSelection/>
                        <IntegratedFiltering/>

                        <VirtualTable/>

                        <TableHeaderRow/>
                        <TableGroupRow/>
                        <TableSelection
                            selectByRowClick cellComponent={this.selectedCell}
                        />

                        <Toolbar/>
                        <SearchPanel/>
                    </Grid>
                </Paper>
                <div className="export-container">
                    <Paper style={{margin: "1em"}}>
                        <Grid
                            rows={_.uniq(_.concat(selection, ...selectionAsIndeterminate).map((id) => rows.find((e => e.id === id))))}
                            columns={columns}
                            getRowId={this.getRowId}
                        >
                            <SortingState
                                sorting={sorting}
                                onSortingChange={onSortingChange}
                            />
                            <SelectionState
                                selection={selection}
                                onSelectionChange={onSelectionChange}
                            />

                            <IntegratedSorting/>
                            <IntegratedSelection/>

                            <VirtualTable/>

                            <TableHeaderRow/>
                            <TableSelection
                                cellComponent={this.deletedCell}
                            />

                            <Toolbar/>
                            <Template
                                name="toolbarContent"
                            >
                                <TemplatePlaceholder/>
                                <Button onClick={createPackage}>
                                    Export
                                </Button>
                                <Spacer grow='1'/>
                                <Button onClick={onSelectionClear}>
                                    Clear
                                </Button>
                            </Template>
                        </Grid>
                    </Paper>

                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    grid: state.grid,
    d2: state.d2,
    database: state.database
});

const mapDispatchToProps = dispatch => ({
    onSelectionChange: selection => dispatch(createGridAction('selection', selection)),
    onSearchValueChange: searchValue => dispatch(createGridAction('searchValue', searchValue)),
    onSortingChange: sorting => dispatch(createGridAction('sorting', sorting)),
    onGroupingChange: grouping => dispatch(createGridAction('grouping', grouping)),
    onSelectionClear: () => {
        dispatch(createGridAction('selection', []));
        dispatch(createGridAction('selectionAsIndeterminate', []));
        extractor.clearDependencies();
    },
    removeFromSelection: id => dispatch({type: actionTypes.GRID_REMOVE_FROM_SELECTION, id: id})
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MetadataGrid);