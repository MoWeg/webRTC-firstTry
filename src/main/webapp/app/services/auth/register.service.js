(function () {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .factory('Register', Register);

    Register.$inject = ['$resource'];

    function Register ($resource) {
        return $resource('api/register', {}, {});
    }
})();
