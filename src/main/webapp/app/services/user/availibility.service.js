(function() {
    'use strict';
    /* globals SockJS, Stomp */

    angular
        .module('simpleWebrtcServerApp')
        .factory('AvailibilityService', AvailibilityService);

    AvailibilityService.$inject = [ '$resource'];

    function AvailibilityService ( $resource) {
      var service = $resource('api/availability/', {}, {
        'get': {
            method: 'GET',
            isArray: true,
            transformResponse: function (data) {
                data = angular.fromJson(data);
                return data;
            }
        },
        'post':{method: 'POST'},
        'delete':{method: 'DELETE'}
      });
      return service;
    }
})();
