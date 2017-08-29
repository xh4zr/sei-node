'use strict';

const Q = require('q');
const Page = require('./../base/Page');


function pop(obj, key) {
    if (obj.hasOwnProperty(key)) {
        var result = obj[key];
        if (!delete obj[key]) { throw new Error('error deleting'); }
        return result;
    }
}

class ItemAPI {
    constructor(httpContext, examId) {
        this._httpContext = httpContext;
        this._baseUrl = `http://localhost:5000/api/exams/${examId}/items`;
    }
    _genQueryString(params) {
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
    get(kwargs) {
        let itemId = pop(kwargs, 'itemId');

        if (!itemId) {
            throw new Error('item id required');
        }

        let queryString = this._genQueryString(kwargs);

        let deferred = Q.defer();
        let url = `${this._baseUrl}/${itemId}${queryString}`;
        this._httpContext.get(url, (error, response, body) => {
            if (error || response.statusCode >= 400) {
                let msg = { status: response.statusCode, data: body };
                deferred.reject(msg);
            }
            deferred.resolve(body);
        });
        return deferred.promise;
    }
    list(kwargs) {
        kwargs = kwargs || {};
        kwargs.page = kwargs.page || 1;
        kwargs.per_page = kwargs.per_page || 30;

        let queryString = this._genQueryString(kwargs);

        let deferred = Q.defer();
        let url = `${this._baseUrl}${queryString}`;
        this._httpContext.get(url, (error, response, body) => {
            if (error || response.statusCode >= 400) {
                let msg = { status: response.statusCode, data: body };
                deferred.reject(msg);
            }
            deferred.resolve(new Page(body.results, body.total, kwargs.page, kwargs.per_page));
        });
        return deferred.promise;
    }
    makeLive(kwargs) {
        let itemJson = kwargs.itemJson;
        let versionNumber = itemJson.version.version_number || '-1';

        let payload = {
            'version_number': versionNumber
        };

        let deferred = Q.defer();
        let req = {
            url: `${this._baseUrl}/${item_id}/activate_version`,
            method: 'post',
            json: payload
        };
        this._httpContext(req, (error, response, body) => {
            if (error || response.statusCode >= 400) {
                let msg = { status: response.statusCode, data: body };
                deferred.reject(msg);
            }
            deferred.resolve(body);
        });
        return deferred.promise;
    }
    create(kwargs) {
        let itemJson = pop(kwargs, 'itemJson');
        let queryString = this._genQueryString(kwargs);

        let deferred = Q.defer();
        let req = {
            url: this._baseUrl,
            method: 'post',
            json: itemJson
        };
        this._httpContext(req, (error, response, body) => {
            if (error || response.statusCode >= 400) {
                let msg = { status: response.statusCode, data: body };
                deferred.reject(msg);
            }
            deferred.resolve(body);
        });
        return deferred.promise;
    }
    save(kwargs) {
        let itemId = pop(kwargs, 'itemId') || false;
        let isNew = pop(kwargs, 'isNew') || false;

        if (itemId || isNew) {
            let itemJson = pop(kwargs, 'itemJson');
            let queryString = this._genQueryString(kwargs);
            let req = {
                url: `${this._baseUrl}/${itemId}`,
                method: 'put',
                json: itemJson
            };
            let deferred = Q.defer();
            this._httpContext(req, (error, response, body) => {
                if (error || response.statusCode >= 400) {
                    let msg = { status: response.statusCode, data: body };
                    deferred.reject(msg);
                }
                deferred.resolve(body);
            });
            return deferred.promise;
        } else {
            return this.create(kwargs);
        }
    }
    bulkUpdate(kwargs) {
        let payload = {
            field: kwargs.field,
            items: kwargs.items_to_update
        };
        let deferred = Q.defer();
        let req = {
            url: `${this._baseUrl}/bulk_update`,
            method: 'post',
            json: payload
        };
        this._httpContext(req, (error, response, body) => {
            if (error || response.statusCode >= 400) {
                let msg = { status: response.statusCode, data: body };
                deferred.reject(msg);
            }
            deferred.resolve(body);
        });
        return deferred.promise;
    }
}

module.exports = ItemAPI;
