import {store} from '../store';
import * as actionTypes from '../actions/actionTypes';
import * as settingsAction from "../actions/settingsAction";

/**
 * For each metadataType (* represents all) we can define a defaultCondition
 * and a set of rules for the dependency type.
 * @type {{metadataType: string, defaultCondition: boolean, rules: *[]}[]}
 */
export let dependencyRules = [
    {
        "metadataType": "*", // Any
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
        "defaultCondition": () => true,
        "rules": [
            {
                "metadataType": "organisationUnit", // Children orgUnits
                "condition": () => store.getState().settings[actionTypes.SETTINGS_ORG_UNIT_CHILDREN]
                    === settingsAction.ORG_UNIT_CHILDREN_PARSE_OPTION
            }
        ]
    },
    {
        "metadataType": "category",
        "defaultCondition": () => false,
        "rules": []
    },
    {
        "metadataType": "categoryOptionCombo",
        "defaultCondition": () => true,
        "rules": [
            {
                "metadataType": "categoryCombo",
                "condition": () => false
            }
        ]
    },
    {
        "metadataType": "categoryOption",
        "defaultCondition": () => false,
        "rules": []
    }
];