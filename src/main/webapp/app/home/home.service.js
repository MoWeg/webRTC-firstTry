(function() {
    'use strict';
    angular
        .module('simpleWebrtcServerApp')
        .factory('HomeService', HomeService);

    HomeService.$inject = ['Scenario', 'PaginationUtil', 'paginationConstants'];

    function HomeService(Scenario, PaginationUtil, paginationConstants) {
        var constants = {
            page: {
                value: '1',
                squash: true
            },
            sort: {
                value: 'id,asc',
                squash: true
            },
            search: null
        };

        var page = PaginationUtil.parsePage(constants.page);
        var sort = constants.sort;
        var predicate = PaginationUtil.parsePredicate(constants.sort.value);
        var reverse = PaginationUtil.parseAscending(constants.sort.value);



        var service = {
            getAllScenariosFor: getAllScenariosFor
        }
        return service;

        function getAllScenariosFor(params, onSuccess, onError) {
            params.page = page - 1;
            params.size = paginationConstants.itemsPerPage;
            params.sort = sort();

            Scenario.query(params, onSuccess, onError);

            function sort() {
                var result = [predicate + ',' + (reverse ? 'asc' : 'desc')];
                if (predicate !== 'id') {
                    result.push('id');
                }
                return result;
            }
        }
    }
})();