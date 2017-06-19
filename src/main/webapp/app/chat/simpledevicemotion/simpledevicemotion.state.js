(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('simpledevicemotion', {
            parent: 'chat',
            url: '/simpledevicemotion',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'device motion!!!'
            },
            views: {
                'content@': {
                    templateUrl: 'app/chat/simpledevicemotion/simpledevicemotion.html',
                    controller: 'SimpleDeviceMotionController',
                    controllerAs: 'vm'
                }
            },
        });
    }
})();
