(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('simpledeviceorientation', {
            parent: 'chat',
            url: '/simpledeviceorientation',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'device orientation!!!'
            },
            views: {
                'content@': {
                    templateUrl: 'app/chat/simpledeviceorientation/simpledeviceorientation.html',
                    controller: 'SimpleDeviceOrienationController',
                    controllerAs: 'vm'
                }
            },
        });
    }
})();
