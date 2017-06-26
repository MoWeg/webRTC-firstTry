(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('motion2orientation', {
            parent: 'threejs3d',
            url: '/motion2orientation',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'device and Orientation motion!!!'
            },
            views: {
                'content@': {
                    templateUrl: 'app/threejs3d/motion2orientation/motion2orientation.html',
                    controller: 'Motion2OrientationController',
                    controllerAs: 'vm'
                }
            },
        });
    }
})();
