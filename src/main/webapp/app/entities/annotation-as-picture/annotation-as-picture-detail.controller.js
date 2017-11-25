(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('AnnotationAsPictureDetailController', AnnotationAsPictureDetailController);

    AnnotationAsPictureDetailController.$inject = ['$scope', '$rootScope', '$stateParams', 'previousState', 'entity', 'AnnotationAsPicture', 'Scenario'];

    function AnnotationAsPictureDetailController($scope, $rootScope, $stateParams, previousState, entity, AnnotationAsPicture, Scenario) {
        var vm = this;

        vm.annotationAsPicture = entity;
        vm.previousState = previousState.name;

        var unsubscribe = $rootScope.$on('simpleWebrtcServerApp:annotationAsPictureUpdate', function(event, result) {
            vm.annotationAsPicture = result;
        });
        $scope.$on('$destroy', unsubscribe);
    }
})();
