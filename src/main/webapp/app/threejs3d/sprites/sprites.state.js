(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('sprites', {
            parent: 'threejs3d',
            url: '/sprites',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'device motion does something!!!'
            },
            views: {
                'content@': {
                    templateUrl: 'app/threejs3d/sprites/sprites.html',
                    controller: 'SpritesController',
                    controllerAs: 'vm'
                }
            },
        });
    }
})();
