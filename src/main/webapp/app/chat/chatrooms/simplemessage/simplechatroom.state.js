(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('simplechatroom', {
            parent: 'chat',
            url: '/simplechatroom1on1',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'Chat!!!'
            },
            views: {
                'content@': {
                    templateUrl: 'app/chat/chatrooms/simplemessage/simplechatroom.html',
                    controller: 'SimpleChatRoomController',
                    controllerAs: 'vm'
                }
            },
            onEnter: ['JhiTrackerService', function(JhiTrackerService) {
                JhiTrackerService.subscribeToSelf();
                JhiTrackerService.subscribeToPartner();
            }],
            onExit: ['JhiTrackerService', function(JhiTrackerService) {
                JhiTrackerService.unsubscribeChatRooms();
            }]
        });
    }
})();
