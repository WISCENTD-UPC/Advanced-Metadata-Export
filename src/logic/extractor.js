import * as traverse from "traverse";

const DEBUG = process.env.REACT_APP_DEBUG;
let fetchedItems = new Set();

/**
 * If item does not exists queries d2 to get and store the item
 * @param builder: Object with d2, database, id and type
 */
export function fetchAndRetrieve(builder) {
    if (fetchedItems.has(builder.id)) {
        if (DEBUG) console.log('fetchAndRetrieve: Element ' + builder.id + ' (' + builder.type + ') exists, using local copy');
    } else {
        if (DEBUG) console.log('fetchAndRetrieve: Element ' + builder.id + ' (' + builder.type + ') does not exist, parsing it');
        fetchedItems.add(builder.id);
        builder.d2.models[builder.type].get(builder.id).then(element => {
            if (DEBUG) console.log('fetchAndRetrieve: Element ' + builder.id + ' (' + builder.type + ') stored on database');
            cleanUpElement(element.toJSON()).then((result) => {
                builder.database.get(builder.id).then(function (doc) {
                    builder.database.put({
                        _id: builder.id,
                        type: builder.type,
                        json: result,
                        _rev: doc._rev
                    });
                }).catch(function () {
                    builder.database.put({
                        _id: builder.id,
                        type: builder.type,
                        json: result,
                    });
                });

                // Call recursive parsing
                recursiveParse({
                    d2: builder.d2,
                    element: result,
                    type: builder.type
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
    }
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
                if (shouldDeepCopy(builder.type, parent.key)) {
                    if (parent.key === 'children') {
                        if (DEBUG) console.log('recursiveParse: Children copy of ' + item + ' (' + builder.type + ')');
                        next(item, builder.type);
                    } else {
                        next(item, parent.key);
                    }
                } else if (DEBUG) console.log('recursiveParse: Shallow copy of ' + item + ' (' + parent.key + ')');
            }
        }
    });
}

function shouldDeepCopy(type, key) {
    if (key === 'user' || key === 'users') return false;
    else if (key === 'organisationUnit' || key === 'organisationUnits') return false;
    return true;
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

/**
 * Creates an export package
 * @param builder: Object with d2 and database
 * @param elements: Element list to be exported
 * @returns {Promise<any>}: Promise that either resolves or rejects
 */
export function createPackage(builder, elements) {
    return new Promise(function (resolve, reject) {
        let resultObject = {date: Date.now()};

        // TODO: This should be changed, good for demo not production
        builder.database.allDocs({
            include_docs: true,
        }).then(function (result) {
            // handle result
            for (let i = 0; i < result.rows.length; ++i) {
                let element = result.rows[i].doc;
                let elementType = builder.d2.models[element.type].plural;
                if (resultObject[elementType] === undefined) resultObject[elementType] = [];
                resultObject[elementType].push(element.json);
            }
            resolve(resultObject);
        }).catch(function (err) {
            console.log(err);
            reject(err);
        });
    });
}