(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('simplechat', {
            parent: 'chat',
            url: '/simplechat',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'Simple Chat'
            },
            views: {
                'content@': {
                    templateUrl: 'app/chat/simplechat/simplechat.html',
                    controller: 'SimpleChatController',
                    controllerAs: 'vm'
                }
            },
            onEnter: ['JhiTrackerService', function(JhiTrackerService) {
                JhiTrackerService.subscribeSimpleMessage();
            }],
            onExit: ['JhiTrackerService', function(JhiTrackerService) {
                JhiTrackerService.unsubscribeSimpleMessage();
            }]
        });
    }
})();
