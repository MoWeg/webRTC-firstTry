(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('TaskDetailController', TaskDetailController);

    TaskDetailController.$inject = ['$scope', '$rootScope', '$stateParams', 'previousState', 'entity', 'Task', 'Scenario'];

    function TaskDetailController($scope, $rootScope, $stateParams, previousState, entity, Task, Scenario) {
        var vm = this;

        vm.task = entity;
        vm.previousState = previousState.name;

        var unsubscribe = $rootScope.$on('simpleWebrtcServerApp:taskUpdate', function(event, result) {
            vm.task = result;
        });
        $scope.$on('$destroy', unsubscribe);
    }
})();
