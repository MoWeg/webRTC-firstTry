(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('proto1on1expert', {
            parent: 'chat',
            url: '/proto1on1expert',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'Chat With VIDEO!!!'
            },
            views: {
                'content@': {
                    templateUrl: 'app/chat/chatrooms/proto/proto1on1expert.html',
                    controller: 'Proto1on1ExpertController',
                    controllerAs: 'vm'
                }
            },
            onEnter: ['JhiTrackerService', function(JhiTrackerService) {
                JhiTrackerService.subscribeToSelf();
            }],
            onExit: ['JhiTrackerService', function(JhiTrackerService) {
                JhiTrackerService.unsubscribeChatRooms();
            }]
        });
    }
})();
