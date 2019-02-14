import * as actionTypes from "../actions/actionTypes";
import {defaultBlacklist, namespaceName} from "../logic/configuration";

const blacklist = (state = defaultBlacklist, action) => {
    switch (action.type) {
        case actionTypes.GET_USER_BLACKLIST:
            action.d2.currentUser.dataStore.has(namespaceName).then(exists => {
                if (!exists) {
                    action.d2.currentUser.dataStore.create(namespaceName).then(namespace => {
                        namespace.set('default', defaultBlacklist);
                        return defaultBlacklist;
                    });
                } else {
                    action.d2.currentUser.dataStore.get(namespaceName).then(namespace => {
                        namespace.get('default').then(result => {
                            return result;
                        });
                    });
                }
            });
            break;
        case actionTypes.UPDATE_USER_BLACKLIST:
            action.d2.currentUser.dataStore.has(namespaceName).then(exists => {
                if (!exists) {
                    action.d2.currentUser.dataStore.create(namespaceName).then(namespace => {
                        namespace.set('default', action.blacklist);
                    });
                } else {
                    action.d2.currentUser.dataStore.get(namespaceName).then(namespace => {
                        namespace.set('default', action.blacklist);
                    });
                }
            });
            return action.blacklist;
        default:
            return state;
    }
};

export default blacklist;