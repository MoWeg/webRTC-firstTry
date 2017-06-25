(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('simple3d', {
            parent: 'threejs3d',
            url: '/simple3d',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'three deee!!!'
            },
            views: {
                'content@': {
                    templateUrl: 'app/threejs3d/simple3d/simple3d.html',
                    controller: 'Simple3DController',
                    controllerAs: 'vm'
                }
            },
        });
    }
})();
