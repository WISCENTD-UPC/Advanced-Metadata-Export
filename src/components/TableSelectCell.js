import * as React from 'react';
import classNames from 'classnames';
import Checkbox from '@material-ui/core/Checkbox';
import TableCell from '@material-ui/core/TableCell';
import withStyles from '@material-ui/core/styles/withStyles';
import IconButton from "@material-ui/core/IconButton/IconButton";
import VisibilityIcon from "@material-ui/icons/Visibility";

const styles = theme => ({
    cell: {
        overflow: "visible",
        paddingRight: 0,
        paddingLeft: theme.spacing.unit,
        textAlign: "center"
    },
    checkbox: {
        marginTop: "-1px",
        marginBottom: "-1px"
    }
});

export const TableSelectCellBase = ({
                                        style,
                                        selected,
                                        onToggle,
                                        onDelete,
                                        onViewDetail,
                                        classes,
                                        className,
                                        row,
                                        tableRow,
                                        tableColumn,
                                        indeterminate,
                                        ...restProps
                                    }) => (
    <TableCell
        padding="checkbox"
        style={style}
        className={classNames(classes.cell, className)}
        {...restProps}
    >
        <div style={{display: "flex", flexFlow: "row nowrap"}}>
            <Checkbox
                className={classes.checkbox}
                checked={selected}
                indeterminate={indeterminate}
                onClick={e => {
                    e.stopPropagation();
                    onToggle();
                }}
            />
            <IconButton aria-label="View" onClick={e => {
                e.stopPropagation();
                onViewDetail();
            }}>
                <VisibilityIcon/>
            </IconButton>
        </div>
    </TableCell>
);

export const TableSelectCell = withStyles(styles, {name: "TableSelectCell"})(
    TableSelectCellBase
);
