(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
        .state('scenario', {
            parent: 'entity',
            url: '/scenario?page&sort&search',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'Scenarios'
            },
            views: {
                'content@': {
                    templateUrl: 'app/entities/scenario/scenarios.html',
                    controller: 'ScenarioController',
                    controllerAs: 'vm'
                }
            },
            params: {
                page: {
                    value: '1',
                    squash: true
                },
                sort: {
                    value: 'id,asc',
                    squash: true
                },
                search: null
            },
            resolve: {
                pagingParams: ['$stateParams', 'PaginationUtil', function ($stateParams, PaginationUtil) {
                    return {
                        page: PaginationUtil.parsePage($stateParams.page),
                        sort: $stateParams.sort,
                        predicate: PaginationUtil.parsePredicate($stateParams.sort),
                        ascending: PaginationUtil.parseAscending($stateParams.sort),
                        search: $stateParams.search
                    };
                }]
            }
        })
        .state('scenario-detail', {
            parent: 'scenario',
            url: '/scenario/{id}',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'Scenario'
            },
            views: {
                'content@': {
                    templateUrl: 'app/entities/scenario/scenario-detail.html',
                    controller: 'ScenarioDetailController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                entity: ['$stateParams', 'Scenario', function($stateParams, Scenario) {
                    return Scenario.get({id : $stateParams.id}).$promise;
                }],
                previousState: ["$state", function ($state) {
                    var currentStateData = {
                        name: $state.current.name || 'scenario',
                        params: $state.params,
                        url: $state.href($state.current.name, $state.params)
                    };
                    return currentStateData;
                }]
            }
        })
        .state('scenario-detail.edit', {
            parent: 'scenario-detail',
            url: '/detail/edit',
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/scenario/scenario-dialog.html',
                    controller: 'ScenarioDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['Scenario', function(Scenario) {
                            return Scenario.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('^', {}, { reload: false });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('scenario.new', {
            parent: 'scenario',
            url: '/new',
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/scenario/scenario-dialog.html',
                    controller: 'ScenarioDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: function () {
                            return {
                                name: null,
                                description: null,
                                id: null
                            };
                        }
                    }
                }).result.then(function() {
                    $state.go('scenario', null, { reload: 'scenario' });
                }, function() {
                    $state.go('scenario');
                });
            }]
        })
        .state('scenario.edit', {
            parent: 'scenario',
            url: '/{id}/edit',
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/scenario/scenario-dialog.html',
                    controller: 'ScenarioDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['Scenario', function(Scenario) {
                            return Scenario.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('scenario', null, { reload: 'scenario' });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('scenario.delete', {
            parent: 'scenario',
            url: '/{id}/delete',
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/scenario/scenario-delete-dialog.html',
                    controller: 'ScenarioDeleteController',
                    controllerAs: 'vm',
                    size: 'md',
                    resolve: {
                        entity: ['Scenario', function(Scenario) {
                            return Scenario.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('scenario', null, { reload: 'scenario' });
                }, function() {
                    $state.go('^');
                });
            }]
        });
    }

})();
