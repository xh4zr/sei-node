'use strict';

const Q = require('q');
const UrlProvider = require('./../base/Providers').UrlProvider;
const helpers = require('./../helpers');


class ExamAPI {
    constructor(httpContext, examId) {
        this._httpContext = httpContext;
        let apiUrl = UrlProvider.prototype.getApi();
        this._baseUrl = `${apiUrl}/exams/${examId}`;
    }
    get(kwargs) {
        let queryString = helpers.generateQueryString(kwargs);
        let deferred = Q.defer();
        this._httpContext.get(`${this._baseUrl}${queryString}`, (error, response, body) => {
            if (error || response.statusCode >= 400) {
                let msg = { status: response.statusCode, data: body };
                deferred.reject(msg);
            }
            deferred.resolve(body);
        });
        return deferred.promise;
    }
    save(examJson) {
        let include = [];
        if (examJson.settings) {
            include[include.length] = 'settings'
        }

        let queryString = helpers.generateQueryString({ include: include });

        let deferred = Q.defer();
        let req = {
            url: `${this._baseUrl}${queryString}`,
            method: 'put',
            json: examJson
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
    getSettings() {
        return this.get({ include: 'settings' }).then((examJson) => {
            return examJson.settings;
        });
    }
    putSettings(settingsJson) {
        let examJson = { settings: settingsJson };
        return this.save(examJson).then((exam) => {
            return exam.settings;
        });
    }
    createLaunchpad(kwargs) {
        let launchpadJson = kwargs.launchpad;
        let _exam = kwargs.exam;
        let task = undefined;

        if (_exam) {
            task = new Promise((resolve, reject) => {
                resolve(_exam);
            });
        } else {
            task = this.get({ include: 'settings' });
        }

        return task.then((exam) => {
            exam.settings.launchpads = exam.settings.launchpads || [];
            exam.settings.launchpads.push(launchpadJson);
            return this.save(exam);
        }).then((exam) => {
            let name = escape(launchpadJson.name.toLowerCase());
            let launchpadUrl = UrlProvider.prototype.getLaunchpad();
            return `${launchpadUrl}/${exam.slug}/${name}`;
        });
    }
}

module.exports = ExamAPI;
