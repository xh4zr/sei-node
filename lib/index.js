'use strict';

const Request = require('request');
const DeliveryAPI = require('./rest/Delivery');
const ExamAPI = require('./rest/Exam');
const ItemAPI = require('./rest/Item');


class SeiClient {
    constructor(httpContext, examId) {
        this.delivery = new DeliveryAPI(httpContext, examId);
        this.exam = new ExamAPI(httpContext, examId);
        this.item = new ItemAPI(httpContext, examId);
    }   
}

exports.createClientWithContext = function createClientWithContext(username, password, examId, roleSecret) {
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