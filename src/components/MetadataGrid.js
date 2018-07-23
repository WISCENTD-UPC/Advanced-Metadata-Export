import * as React from 'react';
import {connect} from "react-redux";
import Paper from '@material-ui/core/Paper';
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

import {createGridAction} from "../actions/gridAction";
import Button from "@material-ui/core/es/Button/Button";

import * as extractor from '../logic/extractor';

class MetadataGrid extends React.PureComponent {
    render() {
        const {
            rows, columns, selection, searchValue, sorting, grouping
        } = this.props.grid;

        const {
            onSelectionChange, onSearchValueChange, onSelectionClear, onSortingChange, onGroupingChange
        } = this.props;

        const getRowId = row => row.id;
        const createPackage = () => extractor.handleCreatePackage({d2: this.props.d2, database: this.props.database}, selection);

        return (
            <Paper>
                <Grid
                    rows={rows}
                    columns={columns}
                    getRowId={getRowId}
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
                        selectByRowClick
                    />

                    <Toolbar/>
                    <Template
                        name="toolbarContent"
                    >
                        <TemplatePlaceholder/>
                        <Button onClick={createPackage}>
                            Export
                        </Button>
                        <Button onClick={onSelectionClear}>
                            Clear
                        </Button>
                        <Spacer grow='1'/>
                    </Template>
                    <SearchPanel/>
                </Grid>
            </Paper>
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
    onSelectionClear: () => dispatch(createGridAction('selection', []))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MetadataGrid);