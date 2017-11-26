(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('home', {
            parent: 'app',
            url: '/',
            data: {
                authorities: []
            },
            views: {
                'content@': {
                    templateUrl: 'app/home/home.html',
                    controller: 'HomeController',
                    controllerAs: 'vm'
                }
            }
        }).state('home-agent', {
            parent: 'home',
            data: {
                authorities: ['ROLE_AGENT']
            },
            views: {
                'content@': {
                    templateUrl: 'app/home/children/agent.html',
                    controller: 'HomeAgentOrExpertController',
                    controllerAs: 'vm'
                }
            },
            params: {
                id: null,
                expert: false
            }
        }).state('home-expert', {
            parent: 'home',
            data: {
                authorities: ['ROLE_EXPERT']
            },
            views: {
                'content@': {
                    templateUrl: 'app/home/children/expert.html',
                    controller: 'HomeAgentOrExpertController',
                    controllerAs: 'vm'
                }
            },
            params: {
                id: null,
                expert: false
            }
        });
    }
})();