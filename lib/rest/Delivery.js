'use strict';

const Q = require('q');
const Page = require('./../base/Page');
const UrlProvider = require('./../base/Providers').UrlProvider;
const helpers = require('./../helpers');


class DeliveryAPI {
    constructor(httpContext, examId) {
        this._httpContext = httpContext;
        let apiUrl = UrlProvider.prototype.getApi();
        this._baseUrl = `${apiUrl}/exams/${examId}/deliveries`;
    }
    get(kwargs) {
        let deliveryId = helpers.pop(kwargs, 'deliveryId');
        if (!deliveryId) {
            throw new Error('delivery id required');
        }

        let queryString = helpers.generateQueryString(kwargs);

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
            let takeUrl = UrlProvider.prototype.getTake();
            let url = `${takeUrl}?launch_token=${token}`;
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
            let proctorUrl = UrlProvider.prototype.getProctor();
            let url = `${proctorUrl}/${token}`;
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
