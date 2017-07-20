(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('multiplecanvas', {
            parent: 'threejs3d',
            url: '/multiplecanvas',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'three deee!!!'
            },
            views: {
                'content@': {
                    templateUrl: 'app/threejs3d/multiplecanvas/multiplecanvas.html',
                    controller: 'MultipleCanvasController',
                    controllerAs: 'vm'
                }
            },
        });
    }
})();
