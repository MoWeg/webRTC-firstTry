(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('simpledeviceorientation', {
            parent: 'threejs3d',
            url: '/simpledeviceorientation',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'device orientation!!!'
            },
            views: {
                'content@': {
                    templateUrl: 'app/threejs3d/simpledeviceorientation/simpledeviceorientation.html',
                    controller: 'SimpleDeviceOrienationController',
                    controllerAs: 'vm'
                }
            },
        });
    }
})();
