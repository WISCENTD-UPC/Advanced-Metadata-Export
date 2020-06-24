import {store} from '../store';
import * as actionTypes from '../actions/actionTypes';
import * as settingsAction from "../actions/settingsAction";

/**
 * For each metadataType (* represents all) we can define a set of rules for the dependency type.
 * @type {{metadataType: string, rules: [{metadataType: string, condition: function}]}}
 */
export let dependencyRules = [
    {
        "metadataType": "*",
        "rules": [
            {
                "metadataType": "user",
                "condition": () => false
            },
            {
                "metadataType": "organisationUnit",
                "condition": () => false
            }
        ]
    },
    {
        "metadataType": "organisationUnit",
        "rules": [
            {
                "metadataType": "organisationUnit", // Children orgUnits
                "condition": () => store.getState().settings[actionTypes.SETTINGS_ORG_UNIT_CHILDREN]
                    === settingsAction.ORG_UNIT_CHILDREN_PARSE_OPTION
            }
        ]
    }
];

/**
 * For each metadataType (* represents all) we can define a set of blacklisted types.
 */
export const namespaceName = 'export-metadata-blacklist';
export let defaultBlacklist = {
    "*": [],
    "category": [
        "categoryCombo",
        "categoryOption"
    ],
    "categoryCombo": [
        "category"
    ],
    "categoryOption": [
        "category",
        "categoryOptionCombo"
    ],
    "categoryOptionCombo": [
        "categoryCombo"
    ],
    "dataElement": [
        "dataSet"
    ],
    "dataElementGroup": [
        "dataElement"
    ],
    "programSection": [
        "program"
    ],
    "programIndicator": [
        "program"
    ],
    "programRuleVariable": [
        "program"
    ],
    "indicator": [
        "dataSet"
    ],
    "organisationUnit": [
        "dataSet",
        "program"
    ],
    "section": [
        "dataSet"
    ],
    "dataApprovalWorkflow": [
        "dataSet"
    ],
    "dataSetElement": [
        "dataSet"
    ],
    "program": [
        "userRole"
    ],
    "mapView": [
        "program",
        "programStage"
    ]
};