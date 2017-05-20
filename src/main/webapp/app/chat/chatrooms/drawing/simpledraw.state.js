(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('simpledraw', {
            parent: 'chat',
            url: '/simpledraw1on1',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'Draw!!!'
            },
            views: {
                'content@': {
                    templateUrl: 'app/chat/chatrooms/drawing/simpledraw.html',
                    controller: 'SimpleDrawController',
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
