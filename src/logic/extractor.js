import * as traverse from "traverse";

import {DEBUG} from "../constants";

/**
 * If item does not exists queries d2 to get and store the item
 * @param builder: Object with d2, database, id and type
 */
export function fetchAndRetrieve(builder) {
    builder.database.get(builder.id).then(function (doc) {
        if (DEBUG) console.log('fetchAndRetrieve: Element ' + builder.id + ' (' + builder.type + ') exists, using local copy');
    }).catch(function () {
        if (DEBUG) console.log('fetchAndRetrieve: Element ' + builder.id + ' (' + builder.type + ') does not exist, parsing it');
        builder.d2.models[builder.type].get(builder.id).then(element => {
            if (DEBUG) console.log('fetchAndRetrieve: Element ' + builder.id + ' (' + builder.type + ') stored on database');
            cleanUpElement(element.toJSON()).then((result) => {
                builder.database.put({
                    _id: builder.id,
                    type: builder.type,
                    json: result
                }).catch((err) => console.log(err));
                recursiveParse({
                    d2: builder.d2,
                    element: result
                }, (id, type) => {
                    fetchAndRetrieve({
                        d2: builder.d2,
                        database: builder.database,
                        id: id,
                        type: type
                    });
                });
            });
        });
    });
}

/**
 * Traverse element and call recursion fetchAndRetrieve
 * @param builder: Object with d2 and element to traverse
 * @param next: Callback with id and type
 */
export function recursiveParse(builder, next) {
    traverse(builder.element).forEach(function (item) {
        let context = this;
        if (context.isLeaf && context.key === 'id' && item !== '') {
            let parent = context.parent;
            while (parent.level > 1) parent = parent.parent;
            if (parent !== undefined && parent.key !== undefined && builder.d2.models[parent.key] !== undefined) {
                if (builder.d2.models[parent.key].isShareable) {
                    next(item, parent.key);
                } else if (DEBUG) console.log('recursiveParse: Shallow copy of ' + item + ' (' + parent.key + ')');
            }
        }
    });
}

/**
 * Cleans up a given element
 * @param element: Element in JSON to cleanse
 * @returns {Promise<any>}: Promise that either resolves or rejects
 */
export function cleanUpElement(element) {
    return new Promise(function(resolve, reject) {
        // TODO: Clean up element
        resolve(element);
    });
}