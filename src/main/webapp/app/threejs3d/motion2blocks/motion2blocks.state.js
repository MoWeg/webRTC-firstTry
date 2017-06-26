(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('motion2blocks', {
            parent: 'threejs3d',
            url: '/motion2blocks',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'device motion does something!!!'
            },
            views: {
                'content@': {
                    templateUrl: 'app/threejs3d/motion2blocks/motion2blocks.html',
                    controller: 'Motion2BlocksController',
                    controllerAs: 'vm'
                }
            },
        });
    }
})();
