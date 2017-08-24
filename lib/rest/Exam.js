'use strict';

const Q = require('q');


class ExamSettingsInstance {
    constructor(settingsJson) {
        this._keys = [
            'comments',
            'content_area_split_char',
            'cutscores',
            'delivery_type',
            'description',
            'end_early',
            'examinee_schema',
            'instructions',
            'mark_and_review',
            'max_error',
            'max_items',
            'min_items',
            'mode',
            'score_report_content',
            'score_report_preface',
            'score_scale_lower',
            'score_scale_upper',
            'show_content_area_breakdown',
            'show_email_button',
            'show_pass_fail',
            'show_print_button',
            'show_score',
            'show_score_scale',
            'time_limit',
            'use_org_schema'
        ];

        this.fromJson(settingsJson);
    }
    keys() {
        return this._keys;
    }
    fromJson(data) {
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


class ExamInstance {
    constructor(requestJson) {
        this._keys = [
            'created_at',
            'created_by_id',
            'id',
            'is_migrated',
            'modified_at',
            'modified_by_id',
            'name',
            'organization_id',
            'security_level',
            'settings',
            'slug',
            'sponsor_id',
            'stats_updated_at'
        ];

        this.fromJson(requestJson);
    }
    keys() {
        return this._keys;
    }
    fromJson(data) {
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


class ExamAPI {
    constructor(httpContext, examId) {
        this._httpContext = httpContext;
        this._baseUrl = `http://localhost:5000/api/exams/${examId}`;
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
        let queryString = this._genQueryString(kwargs);
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

        let queryString = this._genQueryString({ include: include });

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
            return `http://localhost:5000/launchpad/${exam.slug}/${name}`;
        });
    }
}

module.exports = ExamAPI;
