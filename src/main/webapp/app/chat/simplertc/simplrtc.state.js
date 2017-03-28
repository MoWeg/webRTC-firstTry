(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('simplertc', {
            parent: 'chat',
            url: '/simplertc',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'Simple RTC'
            },
            views: {
                'content@': {
                    templateUrl: 'app/chat/simplertc/simplertc.html',
                    controller: 'SimpleRtcController',
                    controllerAs: 'vm'
                }
            },
        });
    }
})();
