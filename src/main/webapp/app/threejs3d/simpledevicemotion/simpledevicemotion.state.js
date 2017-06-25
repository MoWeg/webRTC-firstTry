(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('simpledevicemotion', {
            parent: 'threejs3d',
            url: '/simpledevicemotion',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'device motion!!!'
            },
            views: {
                'content@': {
                    templateUrl: 'app/threejs3d/simpledevicemotion/simpledevicemotion.html',
                    controller: 'SimpleDeviceMotionController',
                    controllerAs: 'vm'
                }
            },
        });
    }
})();
