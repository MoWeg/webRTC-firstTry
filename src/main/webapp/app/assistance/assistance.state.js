(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('assistance', {
            parent: 'home',
            url: 'assistance',
            data: {
                authorities: ['ROLE_EXPERT', 'ROLE_AGENT'],
                pageTitle: 'Chat With VIDEO!!!'
            },
            views: {
                'content@': {
                    templateUrl: 'app/assistance/assistance.html',
                    controller: 'AssistanceController',
                    controllerAs: 'vm'
                }
            },
            params: {
                id: null,
                partnerId: null,
                isInitiator: null,
                scenario: null
            },
            onEnter: ['$stateParams', 'JhiTrackerService', function($stateParams, JhiTrackerService) {
                JhiTrackerService.subscribeToSelf($stateParams.id);
            }]
            // onExit: ['JhiTrackerService', function(JhiTrackerService) {
            //     JhiTrackerService.sendSimpleMessageToJsonUser($stateParams.partnerId, {
            //         goal: 'rtc',
            //         content: 'bye'
            //     });
            // }]
        });
    }
})();