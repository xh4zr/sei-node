'use strict';

const Q = require('q');
const Page = require('./../base/Page');
const UrlProvider = require('./../base/Providers').UrlProvider;
const Request = require('request');


class IntegrationAPI {
    constructor(httpContext, examId) {
        this._httpContext = httpContext;
        let apiUrl = UrlProvider.prototype.getApi();
        this._baseUrl = `${apiUrl}/integrations/${examId}`;
    }
    getCredentials(kwargs) {
        let deferred = Q.defer();
        let url = `${this._baseUrl}/credentials`;
        this._httpContext.get(url, (error, response, body) => {
            if (error || response.statusCode >= 400) {
                let msg = { status: response.statusCode, data: body };
                deferred.reject(msg);
            }
            deferred.resolve(body);
        });
        return deferred.promise;
    }
    static getToken(kwargs) {
        let examId = kwargs.examId;
        let username = kwargs.username;
        let password = kwargs.password;

        if (!username) {
            throw new Error('username is required');
        }

        if (!password) {
            throw new Error('password is required');
        }

        if (!examId) {
            throw new Error('exam id is required');
        }

        let deferred = Q.defer();
        let url = String(UrlProvider.prototype.getApi() + '/integrations/' + examId + '/credentials');
        let req = {
            url: url,
            method: 'GET',
            auth: {
                'user': username,
                'pass': password
            },
            json: true
        };
        Request(req, (error, response, body) => {
            if (error || response.statusCode >= 400) {
                let msg = { status: response.statusCode, data: body };
                deferred.reject(msg);
            }
            deferred.resolve(body.token);
        });
        return deferred.promise;
    }
}

module.exports = IntegrationAPI;
