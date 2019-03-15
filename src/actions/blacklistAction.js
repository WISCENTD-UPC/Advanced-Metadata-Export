import {UPDATE_USER_BLACKLIST} from "./actionTypes";
import {defaultBlacklist, namespaceName} from "../logic/configuration";
import {Extractor} from "../logic/extractor";

export const getBlacklistFromServer = (dispatch, d2) => {
    d2.currentUser.dataStore.has(namespaceName).then(exists => {
        if (!exists) {
            d2.currentUser.dataStore.create(namespaceName).then(namespace => {
                namespace.set('default', defaultBlacklist);
                Extractor.getInstance().updateBlacklist(defaultBlacklist);
                dispatch({
                    type: UPDATE_USER_BLACKLIST,
                    blacklist: defaultBlacklist
                });
            });
        } else {
            d2.currentUser.dataStore.get(namespaceName).then(namespace => {
                namespace.get('default').then(result => {
                    Extractor.getInstance().updateBlacklist(result);
                    dispatch({
                        type: UPDATE_USER_BLACKLIST,
                        blacklist: result
                    });
                });
            });
        }
    });
};