'use strict';

const Request = require('request');
const DeliveryAPI = require('./rest/Delivery');
const ExamAPI = require('./rest/Exam');
const ItemAPI = require('./rest/Item');
const IntegrationAPI = require('./rest/Integration');
const UrlProvider = require('./base/Providers').UrlProvider;
const Q = require('q');


class SeiClient {
    constructor(httpContext, examId, integrationInfo) {
        this._httpContext = httpContext;

        this.delivery = new DeliveryAPI(httpContext, examId);
        this.exam = new ExamAPI(httpContext, examId);
        this.item = new ItemAPI(httpContext, examId);
        this.integration = new IntegrationAPI(httpContext, examId, integrationInfo);
    }
    makeRequest(requestObj) {
        let method = requestObj.method || 'GET';
        let resource = requestObj.url;
        if (!resource) {
            throw new Error('url required');
        }
        let apiUrl = UrlProvider.prototype.getApi();
        if (resource.indexOf('//') !== -1) {
            throw new Error('all requests are made to the SEI api and prefixed with ' + apiUrl + '. Please do not include that in your url.');
        }
        let headers = requestObj.headers || {};
        let deferred = Q.defer();
        let req = {
            url: apiUrl + resource,
            method: method,
            headers: headers,
            json: true
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

exports.UrlProvider = UrlProvider;
exports.createClientWithContext = function (username, password, examId, roleSecret) {
    console.error('deprecated... will be removed in the future... use createClientWithBasicAuth... and pass in kwargs');
    let kwargs = {
        username: username,
        password: password,
        examId: examId,
        roleSecret: roleSecret
    };
    return createClientWithBasicAuth(kwargs);
};
exports.createClientWithBasicAuth = function createClientWithBasicAuth(kwargs) {
    console.error('deprecated... will be removed in the future... use createClient or createClientWithToken... and pass in kwargs');
    let username = kwargs.username;
    let password = kwargs.password;
    let examId = kwargs.examId;
    let roleSecret = kwargs.roleSecret;

    if (!username) {
        throw new Error('username is required');
    }

    if (!password) {
        throw new Error('password is required');
    }

    if (!examId) {
        throw new Error('roles are required');
    }

    if (!roleSecret) {
        throw new Error('roles are required');
    }

    let httpDefaults = {
        auth: {
            'user': username,
            'pass': password
        },
        headers: {
            'x-sei-role-secret': roleSecret
        },
        json: true
    };

    let httpContext = Request.defaults(httpDefaults);

    return new SeiClient(httpContext, examId);
}

exports.createClient = function createClient(kwargs) {
    let deferred = Q.defer();
    let token = kwargs['token'];
    let examId = kwargs['examId'];
    let task = undefined;

    if (!token) {
        task = IntegrationAPI.staticGet(kwargs);
    }

    if (!examId) {
        throw new Error('exam id is required');
    }

    if (!task) {
        task = new Promise((resolve, reject) => {
            resolve({ token: token });
        });
    }

    task.then(res => {
        let httpDefaults = {
            auth: {
                'bearer': res.token
            },
            json: true
        };

        let httpContext = Request.defaults(httpDefaults);

        deferred.resolve(new SeiClient(httpContext, examId, res));
    }, () => {
        deferred.reject(false);
    });
    return deferred.promise;
}

exports.createClientWithToken = function createClientWithToken(kwargs) {
    let token = kwargs['token'];
    let examId = kwargs['examId'];

    if (!token) {
        throw new Error('integration <token> is required');
    }

    if (!examId) {
        throw new Error('<examId> is required');
    } else {
        delete kwargs.examId;
    }

    let httpDefaults = {
        auth: {
            'bearer': token
        },
        json: true
    };

    let httpContext = Request.defaults(httpDefaults);
    return new SeiClient(httpContext, examId, kwargs);
}