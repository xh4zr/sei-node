'use strict';

class Page {
    constructor(results, total, page, perPage) {
        this.results = results;
        this.currentPage = page;
        this.totalPages = Math.ceil(total / perPage);
    }
}

module.exports = Page;
