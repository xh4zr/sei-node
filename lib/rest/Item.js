'use strict';

const Q = require('q');
const Page = require('./../base/Page');
const helpers = require('./../helpers');
const UrlProvider = require('./../base/Providers').UrlProvider;


class ItemAPI {
    constructor(httpContext, examId) {
        this._httpContext = httpContext;
        let apiUrl = UrlProvider.prototype.getApi();
        this._baseUrl = `${apiUrl}/exams/${examId}/items`;
    }
    get(kwargs) {
        let itemId = pop(kwargs, 'itemId');

        if (!itemId) {
            throw new Error('item id required');
        }

        let queryString = helpers.generateQueryString(kwargs);

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

        let queryString = helpers.generateQueryString(kwargs);

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
        let itemJson = helpers.pop(kwargs, 'itemJson');
        let queryString = helpers.generateQueryString(kwargs);

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
            let itemJson = helpers.pop(kwargs, 'itemJson');
            let queryString = helpers.generateQueryString(kwargs);
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
