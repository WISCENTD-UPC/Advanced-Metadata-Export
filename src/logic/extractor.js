import _ from 'lodash';
import * as traverse from 'traverse';
import * as FileSaver from 'file-saver';

import {createAjaxQueue} from './ajaxMultiQueue';
import {store} from '../store';
import * as actionTypes from '../actions/actionTypes';

const DEBUG = process.env.REACT_APP_DEBUG;
let fetchedItems = new Set();
let ajaxQueue = createAjaxQueue(25);
let petitions = new Set();
let totalRequests = 0, completedRequests = 0;

/**
 * Fetch and retrieve start point, with a base id to start the query
 * @param builder: Object with d2 and database
 * @param elements: Elements to fetch
 */
export function initialFetchAndRetrieve(builder, elements) {
    return new Promise(function (resolve, reject) {
        clearDependencies();
        if (elements.length === 0) resolve();
        else parseElements(builder.d2, elements).then((json) => {
            fetchAndRetrieve({
                d2: builder.d2,
                database: builder.database,
                json: json
            });
        });

        let _flagCheck = setInterval(function () {
            if (completedRequests === totalRequests) {
                clearInterval(_flagCheck);
                store.dispatch({
                    type: actionTypes.GRID_ADD_DEPENDENCIES,
                    dependencies: _.difference(Array.from(fetchedItems), elements)
                });
                resolve(); // the function to run once all flags are true
            }
        }, 100); // interval set at 100 milliseconds
    });
}

/**
 * If item does not exists queries d2 to get and store the item
 * @param builder: Object with d2, database, json
 */
export function fetchAndRetrieve(builder) {
    _.forEach(builder.json, function (arrayOfElements, type) {
        _.forEach(arrayOfElements, function (element) {
            if (element.id !== undefined) {
                if (DEBUG) console.log('fetchAndRetrieve: Parsing ' + element.id);
                // Insert on the database
                insertIfNotExists(builder.database, element, type);
                // Traverse references and call recursion
                recursiveParse({
                    d2: builder.d2,
                    element: element
                }).then((references => {
                    parseElements(builder.d2, references).then((json) => {
                        fetchAndRetrieve({
                            d2: builder.d2,
                            database: builder.database,
                            json: json
                        });
                    });
                }));
            }
        });
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
                    let key = parent.key === 'children' ? builder.type : parent.key;
                    if (shouldDeepCopy(builder.type, parent.key)) {
                        if (!fetchedItems.has(item)) references.push(item);
                    } else if (DEBUG) console.log('recursiveParse: Shallow copy of ' + item + ' (' + key + ')');
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

export function handleCreatePackage(builder, elements) {
    store.dispatch({type: actionTypes.LOADING, loading: true});
    clearDependencies();
    initialFetchAndRetrieve(builder, elements).then(() => {
        createPackage(builder, elements).then((result) => {
            FileSaver.saveAs(new Blob([JSON.stringify(result, null, 4)], {
                type: 'application/json',
                name: 'extraction.json'
            }), 'extraction.json');
            store.dispatch({type: actionTypes.LOADING, loading: false});
        });
    });
}

/**
 * Creates an export package
 * @param builder: Object with d2 and database
 * @param elements: Elements to export
 * @returns {Promise<any>}: Promise that either resolves or rejects
 */
function createPackage(builder, elements) {
    return new Promise(function (resolve, reject) {
        let next = function () {
            if (DEBUG) console.log('Generating final package');
            let elementSet = new Set(elements);
            let resultObject = {date: new Date().toISOString()};
            builder.database.allDocs({
                include_docs: true,
            }).then(function (result) {
                // handle result
                for (let i = 0; i < result.rows.length; ++i) {
                    let element = result.rows[i].doc;
                    let elementType = builder.d2.models[element.type].plural;
                    if (elementSet.has(element._id)) {
                        if (resultObject[elementType] === undefined) resultObject[elementType] = [];
                        resultObject[elementType].push(element.json);
                    }
                }
                resolve(resultObject);
            }).catch(function (err) {
                console.log(err);
                reject(err);
            });
        };

        let _flagCheck = setInterval(function () {
            if (completedRequests === totalRequests) {
                clearInterval(_flagCheck);
                next(); // the function to run once all flags are true
            }
        }, 100); // interval set at 100 milliseconds
    });
}

function parseElements(d2, elements) {
    return new Promise(function (resolve, reject) {
        _.difference(elements, [...fetchedItems]);
        _.forEach(elements, (element) => fetchedItems.add(element));
        if (elements.length > 0) {
            let requestUrl = d2.Api.getApi().baseUrl + '/metadata.json?fields=:all&filter=id:in:[' + elements.toString() + ']';
            if (!petitions.has(requestUrl)) {
                if (DEBUG) console.log('parseElements: ' + requestUrl);
                totalRequests += 1;
                ajaxQueue.queue({
                    dataType: "json",
                    url: requestUrl,
                    success: function (json) {
                        completedRequests += 1;
                        resolve(json);
                    },
                    fail: reject
                });
            }
            petitions.add(requestUrl);
        }
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

export function clearDependencies() {
    fetchedItems.clear();
}