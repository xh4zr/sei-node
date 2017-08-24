'use strict';

const Q = require('q');
const Page = require('./../base/Page');


class DeliveryInstance {
    constructor(requestJson) {
        this._keys = [
            'created_at',
            'created_by_id',
            'cutscore',
            'estimated_ability',
            'exam_id',
            'examinee_id',
            'form_id',
            'form_version_id',
            'id',
            'is_paused',
            'modified_at',
            'modified_by_id',
            'passed',
            'points_available',
            'points_earned',
            'score',
            'status',
            'type',
            'used_seconds'
        ];

        this.fromJson(requestJson);
    }
    keys() {
        return this._keys;
    }
    fromJson(data) {
        if (!this.id && data.id) {
            this._baseUrl += `/${data.id}`;
        }

        for (let i = 0; i < this._keys.length; i++) {
            let key = this._keys[i];
            this[key] = data[key] || undefined;
        }
    }
    toJson() {
        let data = {};
        for (let i = 0; i < this._keys.length; i++) {
            let key = this._keys[i];
            data[key] = this[key];
        }
        return data;
    }
}


class DeliveryAPI {
    constructor(httpContext, examId) {
        this._httpContext = httpContext;
        this._baseUrl = `http://localhost:5000/api/exams/${examId}/deliveries`;
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
    get(deliveryId, kwargs) {
        if (!deliveryId) {
            throw new Error('delivery id required');
        }

        let queryString = this._genQueryString(kwargs);

        let deferred = Q.defer();
        let url = `${this._baseUrl}/${deliveryId}${queryString}`;
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
    getLaunchUrl(kwargs) {
        let deliveryId = kwargs.delivery_id || kwargs.deliveryId || kwargs.delivery.id;

        if (!deliveryId) {
            throw new Error('delivery id required');
        }

        let deferred = Q.defer();
        this._httpContext.get(`${this._baseUrl}/${deliveryId}/get_launch_token`, (error, response, body) => {
            if (error || response.statusCode >= 400) {
                let msg = { status: response.statusCode, data: body };
                deferred.reject(msg);
            }
            let token = body.launch_token;
            let url = `http://localhost:5000/take?launch_token=${token}`;
            deferred.resolve(url);
        });
        return deferred.promise;
    }
    getProctorUrl(kwargs) {
        let deliveryId = kwargs.delivery_id || kwargs.deliveryId || kwargs.delivery.id;

        if (!deliveryId) {
            throw new Error('delivery id required');
        }

        let deferred = Q.defer();
        this._httpContext.get(`${this._baseUrl}/${deliveryId}/get_proctor_token`, (error, response, body) => {
            if (error || response.statusCode >= 400) {
                let msg = { status: response.statusCode, data: body };
                deferred.reject(msg);
            }
            let token = body.proctor_token;
            let url = `http://localhost:5000/proctor/${token}`;
            deferred.resolve(url);
        });
        return deferred.promise;
    }
    create(deliveryJson) {
        let deferred = Q.defer();
        let req = {
            url: this._baseUrl,
            method: 'post',
            json: deliveryJson
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
    delete(kwargs) {
        let deliveryId = kwargs.delivery_id || kwargs.deliveryId || kwargs.delivery.id;

        if (!deliveryId) {
            throw new Error('delivery id required');
        }

        let deferred = Q.defer();
        this._httpContext.delete(`${this._baseUrl}/${deliveryId}`, (error, response) => {
            if (error || response.statusCode >= 400) {
                let msg = { status: response.statusCode, data: body };
                deferred.reject(msg);
            }
            deferred.resolve(response.statusCode === 204);
        });
        return deferred.promise;
    }
}


module.exports = DeliveryAPI;
