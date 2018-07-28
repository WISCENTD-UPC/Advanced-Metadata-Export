import * as React from 'react';
import classNames from 'classnames';
import Checkbox from '@material-ui/core/Checkbox';
import TableCell from '@material-ui/core/TableCell';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
    cell: {
        overflow: "visible",
        paddingRight: 0,
        paddingLeft: theme.spacing.unit,
        textAlign: "center"
    },
    checkbox: {
        marginTop: "-1px",
        marginBottom: "-1px",
        width: theme.spacing.unit * 5,
        height: theme.spacing.unit * 5
    }
});

export const TableSelectCellBase = ({
                                        style,
                                        selected,
                                        onToggle,
                                        onDelete,
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
        <Checkbox
            className={classes.checkbox}
            checked={selected}
            indeterminate={indeterminate}
            onClick={e => {
                e.stopPropagation();
                onToggle();
            }}
        />
    </TableCell>
);

export const TableSelectCell = withStyles(styles, {name: "TableSelectCell"})(
    TableSelectCellBase
);
