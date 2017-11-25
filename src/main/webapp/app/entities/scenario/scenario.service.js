(function() {
    'use strict';
    angular
        .module('simpleWebrtcServerApp')
        .factory('Scenario', Scenario);

    Scenario.$inject = ['$resource'];

    function Scenario ($resource) {
        var resourceUrl =  'api/scenarios/:id';

        return $resource(resourceUrl, {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    if (data) {
                        data = angular.fromJson(data);
                    }
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    }
})();
