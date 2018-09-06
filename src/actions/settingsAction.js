import * as actionTypes from "../actions/actionTypes";

export const USER_CLEAN_UP_REMOVE_OPTION = 'USER_CLEAN_UP_REMOVE_OPTION';
export const USER_CLEAN_UP_KEEP_OPTION = 'USER_CLEAN_UP_KEEP_OPTION';

export const ORG_UNIT_CHILDREN_PARSE_OPTION = 'ORG_UNIT_CHILDREN_PARSE_OPTION';
export const ORG_UNIT_CHILDREN_ASSUME_OPTION = 'ORG_UNIT_CHILDREN_ASSUME_OPTION';
export const ORG_UNIT_CHILDREN_REMOVE_OPTION = 'ORG_UNIT_CHILDREN_REMOVE_OPTION';

export const optionDialogValues = [
    {
        key: actionTypes.SETTINGS_USER_CLEAN_UP,
        value: 'User identifiers',
        options: [
            {
                key: USER_CLEAN_UP_REMOVE_OPTION,
                value: 'Remove user references'
            },
            {
                key: USER_CLEAN_UP_KEEP_OPTION,
                value: 'Keep user references'
            }
        ]
    },
    {
        key: actionTypes.SETTINGS_ORG_UNIT_CHILDREN,
        value: 'Org unit children',
        options: [
            {
                key: ORG_UNIT_CHILDREN_PARSE_OPTION,
                value: 'Parse org unit children'
            },
            {
                key: ORG_UNIT_CHILDREN_ASSUME_OPTION,
                value: 'Assume org unit children'
            },
            {
                key: ORG_UNIT_CHILDREN_REMOVE_OPTION,
                value: 'Remove org unit children'
            }
        ]
    }
];