(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('chooseroom', {
            parent: 'chat',
            url: '/rooms',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'Choose a user to Chat with'
            },
            views: {
                'content@': {
                    templateUrl: 'app/chat/chatrooms/chooseroom.html',
                    controller: 'ChooseRoomController',
                    controllerAs: 'vm'
                }
            },
            onEnter: ['JhiTrackerService', function(JhiTrackerService) {
                JhiTrackerService.subscribeToAvailable();
            }],
            onExit: ['JhiTrackerService', function(JhiTrackerService) {
                JhiTrackerService.unsubscribeChatRooms();
            }]
        });
    }
})();
