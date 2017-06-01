(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('proto1on1', {
            parent: 'chat',
            url: '/proto1on1',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'Chat With VIDEO!!!'
            },
            views: {
                'content@': {
                    templateUrl: 'app/chat/chatrooms/proto/proto1on1.html',
                    controller: 'Proto1on1Controller',
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
