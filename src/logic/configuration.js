import {store} from '../store';
import * as actionTypes from '../actions/actionTypes';
import * as settingsAction from "../actions/settingsAction";

/**
 * For each metadataType (* represents all) we can define a set of rules for the dependency type.
 * @type {{metadataType: string, defaultCondition: boolean, rules: *[]}[]}
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

export let dependencyBlacklist = [
    {
        "metadataType": "*",
        "blacklist": []
    },
    {
        "metadataType": "categoryCombo",
        "blacklist": [
            "category"
        ]
    },
    {
        "metadataType": "categoryOption",
        "blacklist": [
            "category", "categoryOptionCombo"
        ]
    },
    {
        "metadataType": "categoryOptionCombo",
        "blacklist": [
            "categoryCombo"
        ]
    },
    {
        "metadataType": "dataElement",
        "blacklist": [
            "dataSet"
        ]
    }
];