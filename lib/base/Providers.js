'use strict';

function UrlProvider() {
    this.setEnv = function setEnv(env) {
        if (env === 'local') {
            UrlProvider._api = 'http://localhost:5000/api';
            UrlProvider._take = 'http://localhost:4000';
            UrlProvider._proctor = 'http://localhost:5000/proctor';
            UrlProvider._launchpad = 'http://locahost:5000/launchpad';
        }

        if (env === 'stage') {
            UrlProvider._api = 'https://sei-stage.herokuapp.com/api';
            UrlProvider._take = 'https://sei-stage.herokuapp.com/take';
            UrlProvider._proctor = 'https://sei-stage.herokuapp.com/proctor';
            UrlProvider._launchpad = 'https://sei-stage.herokuapp.com/launchpad';
        }
    }
}

UrlProvider.prototype.getApi = function getApi() {
    return UrlProvider._api || 'https://sei.caveon.com/api';
};

UrlProvider.prototype.getTake = function getTake() {
    return UrlProvider._take || 'https://sei.caveon.com/take';
};

UrlProvider.prototype.getProctor = function getProctor() {
    return UrlProvider._proctor || 'https://sei.caveon.com/proctor';
};

UrlProvider.prototype.getLaunchpad = function getLaunchpad() {
    return UrlProvider._launchpad || 'https://sei.caveon.com/launchpad';
};

module.exports = {
    UrlProvider: UrlProvider
};
