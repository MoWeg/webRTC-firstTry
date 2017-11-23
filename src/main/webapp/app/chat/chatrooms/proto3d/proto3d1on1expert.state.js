(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('proto3d1on1expert', {
            parent: 'chat',
            url: '/proto3d1on1expert',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'Chat With VIDEO!!!'
            },
            views: {
                'content@': {
                    templateUrl: 'app/chat/chatrooms/proto3d/proto3d1on1expert.html',
                    controller: 'Proto3D1on1ExpertController',
                    controllerAs: 'vm'
                }
            },
            params: {
              id: null,
              partnerId: null
            },
            onEnter: ['$stateParams','JhiTrackerService', function($stateParams, JhiTrackerService) {
                JhiTrackerService.subscribeToSelf($stateParams.id);
            }]
            // onExit: ['JhiTrackerService', function(JhiTrackerService) {
            //     JhiTrackerService.unsubscribeChatRooms();
            // }]
        });
    }
})();
