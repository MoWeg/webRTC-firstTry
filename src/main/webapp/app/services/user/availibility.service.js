(function() {
    'use strict';
    /* globals SockJS, Stomp */

    angular
        .module('simpleWebrtcServerApp')
        .factory('AvailibilityService', AvailibilityService);

    AvailibilityService.$inject = [ '$resource'];

    function AvailibilityService ( $resource) {
      var service = $resource('api/availability/:login', {}, {
        'get': {
            method: 'GET',
            transformResponse: function (data) {
                data = angular.fromJson(data);
                return data;
            }
        },
        'post':{method: 'POST'}
      });
      return service;
    }
})();
