(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('ScenarioDetailController', ScenarioDetailController);

    ScenarioDetailController.$inject = ['$scope', '$rootScope', '$stateParams', 'previousState', 'entity', 'Scenario', 'User', 'AnnotationAsPicture', 'Task'];

    function ScenarioDetailController($scope, $rootScope, $stateParams, previousState, entity, Scenario, User, AnnotationAsPicture, Task) {
        var vm = this;

        vm.scenario = entity;
        vm.previousState = previousState.name;

        var unsubscribe = $rootScope.$on('simpleWebrtcServerApp:scenarioUpdate', function(event, result) {
            vm.scenario = result;
        });
        $scope.$on('$destroy', unsubscribe);
    }
})();
