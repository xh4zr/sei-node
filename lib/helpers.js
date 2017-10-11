'use strict';


function _pop(obj, key) {
    if (obj.hasOwnProperty(key)) {
        var result = obj[key];
        if (!delete obj[key]) { throw new Error('error deleting'); }
        return result;
    }
}

function _generateQueryString(params) {
    let query = [];
    let first = true;
    for (let key in params) {
        if (params.hasOwnProperty(key)) {
            let symbol = '&';
            if (first) {
                symbol = '?';
                first = false;
            }

            let value = params[key];

            if (Array.isArray(value)) {
                value = value.join(',');
            }

            query[query.length] = `${symbol}${key}=${value}`;
        }
    }
    return query.join('');
}

module.exports = {
    pop: _pop,
    generateQueryString: _generateQueryString
};
