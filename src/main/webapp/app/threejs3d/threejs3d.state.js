(function () {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('threejs3d', {
            abstract: true,
            parent: 'app'
        });
    }
})();
