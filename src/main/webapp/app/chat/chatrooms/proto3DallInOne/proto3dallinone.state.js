(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('proto3dallIn1', {
            parent: 'chat',
            url: '/proto3dallIn1',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'Chat With VIDEO!!!'
            },
            views: {
                'content@': {
                    templateUrl: 'app/chat/chatrooms/proto3DallInOne/proto3dallinone.html',
                    controller: 'Proto3dallInOnetController',
                    controllerAs: 'vm'
                }
            },
            params: {
                id: null,
                partnerId: null,
                isInitiator: null
            },
            onEnter: ['$stateParams', 'JhiTrackerService', function($stateParams, JhiTrackerService) {
                JhiTrackerService.subscribeToSelf($stateParams.id);
            }]
            // onExit: ['JhiTrackerService', function(JhiTrackerService) {
            //     JhiTrackerService.unsubscribeChatRooms();
            // }]
        });
    }
})();