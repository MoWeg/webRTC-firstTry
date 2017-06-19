(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('simple3d', {
            parent: 'chat',
            url: '/simple3d',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'three deee!!!'
            },
            views: {
                'content@': {
                    templateUrl: 'app/chat/simple3d/simple3d.html',
                    controller: 'Simple3DController',
                    controllerAs: 'vm'
                }
            },
        });
    }
})();
