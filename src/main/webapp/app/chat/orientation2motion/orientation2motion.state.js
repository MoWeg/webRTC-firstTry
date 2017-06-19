(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('orientation2motion', {
            parent: 'chat',
            url: '/orientation2motion',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'three deee!!!'
            },
            views: {
                'content@': {
                    templateUrl: 'app/chat/orientation2motion/orientation2motion.html',
                    controller: 'Orientation2MotionController',
                    controllerAs: 'vm'
                }
            },
        });
    }
})();
