import _ from 'lodash';
import * as traverse from "traverse";
import {createAjaxQueue} from "./ajaxMultiQueue";

const DEBUG = process.env.REACT_APP_DEBUG;
let fetchedItems = new Set();
let ajaxQueue = createAjaxQueue(50);

/**
 * Fetch and retrieve start point, with a base id to start the query
 * @param builder: Object with d2, database, id and type
 */
export function initialFetchAndRetrieve(builder) {
    return new Promise(function (resolve, reject) {
        parseElements(builder.d2, [builder.id]).then((json) => {
            fetchAndRetrieve({
                d2: builder.d2,
                database: builder.database,
                json: json
            }).then(() => {
                console.log('initialFetchAndRetrieve: Finished query for ' + builder.id);
                resolve();
            });
        });
    });
}

/**
 * If item does not exists queries d2 to get and store the item
 * @param builder: Object with d2, database, json
 */
export function fetchAndRetrieve(builder) {
    return new Promise(function (resolve, reject) {
        let arrayOfBrokenPromises = [];
        _.forEach(builder.json, function (arrayOfElements, type) {
            _.forEach(arrayOfElements, function (element) {
                if (element.id !== undefined) {
                    if (DEBUG) console.log('fetchAndRetrieve: Parsing ' + element.id);
                    // Insert on the database
                    arrayOfBrokenPromises.push(insertIfNotExists(builder.database, element, type));
                    // Traverse references and call recursion
                    arrayOfBrokenPromises.push(recursiveParse({
                        d2: builder.d2,
                        element: element
                    }).then((references => {
                        arrayOfBrokenPromises.push(parseElements(builder.d2, references).then((json) => {
                            arrayOfBrokenPromises.push(fetchAndRetrieve({
                                d2: builder.d2,
                                database: builder.database,
                                json: json
                            }));
                        }));
                    })));
                }
            });
        });
        Promise.all(arrayOfBrokenPromises).then(() => resolve());
    });
}

/**
 * Traverse element and call recursion fetchAndRetrieve
 * @param builder: Object with d2 and element to traverse
 */
export function recursiveParse(builder) {
    return new Promise(function (resolve, reject) {
        let references = [];
        traverse(builder.element).forEach(function (item) {
            let context = this;
            if (context.isLeaf && context.key === 'id' && item !== '') {
                let parent = context.parent;
                while (parent.level > 1) parent = parent.parent;
                if (parent !== undefined && parent.key !== undefined && builder.d2.models[parent.key] !== undefined) {
                    if (shouldDeepCopy(builder.type, parent.key)) {
                        let key = parent.key === 'children' ? builder.type : parent.key;
                        if (!fetchedItems.has(item)) references.push(item);
                    } else if (DEBUG) console.log('recursiveParse: Shallow copy of ' + item + ' (' + parent.key + ')');
                }
            }
        });
        resolve(references);
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
    return new Promise(function (resolve, reject) {
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

function parseElements(d2, elements) {
    return new Promise(function (resolve, reject) {
        _.difference(elements, [...fetchedItems]);
        _.forEach(elements, (element) => fetchedItems.add(element));
        if (elements.length > 0) {
            let requestUrl = d2.Api.getApi().baseUrl + '/metadata.json?fields=:all&filter=id:in:[' + elements.toString() + ']';
            if (DEBUG) console.log('parseElements: ' + requestUrl);
            makeRequest(requestUrl).then((json) => {
                resolve(json);
            });
        }
    });
}

function makeRequest(url) {
    return new Promise(function (resolve, reject) {
        ajaxQueue.queue({
            dataType: "json",
            url: url,
            success: resolve,
            fail: reject
        });
    });
}

function insertIfNotExists(database, element, type) {
    return new Promise(function (resolve, reject) {
        database.put({
            _id: element.id,
            type: type,
            json: element,
        }).then(() => resolve()).catch(function (err) {
            if (err.name !== 'conflict') reject(err);
        });
    });
}