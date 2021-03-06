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
