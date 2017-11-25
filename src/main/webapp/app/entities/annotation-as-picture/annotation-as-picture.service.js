(function() {
    'use strict';
    angular
        .module('simpleWebrtcServerApp')
        .factory('AnnotationAsPicture', AnnotationAsPicture);

    AnnotationAsPicture.$inject = ['$resource'];

    function AnnotationAsPicture ($resource) {
        var resourceUrl =  'api/annotation-as-pictures/:id';

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
