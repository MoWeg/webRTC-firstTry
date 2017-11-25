(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
        .state('annotation-as-picture', {
            parent: 'entity',
            url: '/annotation-as-picture?page&sort&search',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'AnnotationAsPictures'
            },
            views: {
                'content@': {
                    templateUrl: 'app/entities/annotation-as-picture/annotation-as-pictures.html',
                    controller: 'AnnotationAsPictureController',
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
        .state('annotation-as-picture-detail', {
            parent: 'annotation-as-picture',
            url: '/annotation-as-picture/{id}',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'AnnotationAsPicture'
            },
            views: {
                'content@': {
                    templateUrl: 'app/entities/annotation-as-picture/annotation-as-picture-detail.html',
                    controller: 'AnnotationAsPictureDetailController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                entity: ['$stateParams', 'AnnotationAsPicture', function($stateParams, AnnotationAsPicture) {
                    return AnnotationAsPicture.get({id : $stateParams.id}).$promise;
                }],
                previousState: ["$state", function ($state) {
                    var currentStateData = {
                        name: $state.current.name || 'annotation-as-picture',
                        params: $state.params,
                        url: $state.href($state.current.name, $state.params)
                    };
                    return currentStateData;
                }]
            }
        })
        .state('annotation-as-picture-detail.edit', {
            parent: 'annotation-as-picture-detail',
            url: '/detail/edit',
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/annotation-as-picture/annotation-as-picture-dialog.html',
                    controller: 'AnnotationAsPictureDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['AnnotationAsPicture', function(AnnotationAsPicture) {
                            return AnnotationAsPicture.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('^', {}, { reload: false });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('annotation-as-picture.new', {
            parent: 'annotation-as-picture',
            url: '/new',
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/annotation-as-picture/annotation-as-picture-dialog.html',
                    controller: 'AnnotationAsPictureDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: function () {
                            return {
                                name: null,
                                fileName: null,
                                path: null,
                                folder: null,
                                toolName: null,
                                id: null
                            };
                        }
                    }
                }).result.then(function() {
                    $state.go('annotation-as-picture', null, { reload: 'annotation-as-picture' });
                }, function() {
                    $state.go('annotation-as-picture');
                });
            }]
        })
        .state('annotation-as-picture.edit', {
            parent: 'annotation-as-picture',
            url: '/{id}/edit',
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/annotation-as-picture/annotation-as-picture-dialog.html',
                    controller: 'AnnotationAsPictureDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['AnnotationAsPicture', function(AnnotationAsPicture) {
                            return AnnotationAsPicture.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('annotation-as-picture', null, { reload: 'annotation-as-picture' });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('annotation-as-picture.delete', {
            parent: 'annotation-as-picture',
            url: '/{id}/delete',
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/annotation-as-picture/annotation-as-picture-delete-dialog.html',
                    controller: 'AnnotationAsPictureDeleteController',
                    controllerAs: 'vm',
                    size: 'md',
                    resolve: {
                        entity: ['AnnotationAsPicture', function(AnnotationAsPicture) {
                            return AnnotationAsPicture.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('annotation-as-picture', null, { reload: 'annotation-as-picture' });
                }, function() {
                    $state.go('^');
                });
            }]
        });
    }

})();
