let allAttributes = [];
let attributesByModel = [];
let referencesByModel = [];
Object.keys(d2.models).forEach(modelName => {
    let modelDef = d2.models[modelName];
    if (modelDef.isMetaData) {
        attributesByModel[modelName] = [];
        referencesByModel[modelName] = [];
        Object.keys(d2.models[modelName].modelValidations).forEach(modelValidation => {
            if (!allAttributes.includes(modelValidation)) allAttributes.push(modelValidation);
            attributesByModel[modelName].push(modelValidation);
            if (d2.models[modelName].modelValidations[modelValidation].type === "REFERENCE") {
                referencesByModel[modelName].push(modelValidation);
            }
        });
    }
});

let result = ', ';
Object.keys(attributesByModel).forEach(key => {
    result += key + ', ';
});

result += '\n';

allAttributes.forEach(attribute => {
    result += attribute + ', ';
    Object.keys(attributesByModel).forEach(key => {
        if (referencesByModel[key].includes(attribute)) result += 'R';
        else if (attributesByModel[key].includes(attribute)) result += 'P';
        result += ', ';
    });
    result += '\n';
});

console.log(result);
window.localStorage.setItem(
    'CSV',
    result
);

console.log('All attributes');
console.log(allAttributes);
window.localStorage.setItem(
    'AllAtributes',
    JSON.stringify(allAttributes)
);

console.log('Attributes by Model');
console.log(attributesByModel);
window.localStorage.setItem(
    'AttributesByModel',
    JSON.stringify(attributesByModel)
);

console.log('References by Model');
console.log(referencesByModel);
window.localStorage.setItem(
    'ReferencesByModel',
    JSON.stringify(referencesByModel)
);