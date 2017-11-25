(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('TaskDialogController', TaskDialogController);

    TaskDialogController.$inject = ['$timeout', '$scope', '$stateParams', '$uibModalInstance', '$q', 'entity', 'Task', 'Scenario'];

    function TaskDialogController ($timeout, $scope, $stateParams, $uibModalInstance, $q, entity, Task, Scenario) {
        var vm = this;

        vm.task = entity;
        vm.clear = clear;
        vm.save = save;
        vm.nexttasks = Task.query({filter: 'previoustask-is-null'});
        $q.all([vm.task.$promise, vm.nexttasks.$promise]).then(function() {
            if (!vm.task.nextTaskId) {
                return $q.reject();
            }
            return Task.get({id : vm.task.nextTaskId}).$promise;
        }).then(function(nextTask) {
            vm.nexttasks.push(nextTask);
        });
        vm.scenarios = Scenario.query();

        $timeout(function (){
            angular.element('.form-group:eq(1)>input').focus();
        });

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function save () {
            vm.isSaving = true;
            if (vm.task.id !== null) {
                Task.update(vm.task, onSaveSuccess, onSaveError);
            } else {
                Task.save(vm.task, onSaveSuccess, onSaveError);
            }
        }

        function onSaveSuccess (result) {
            $scope.$emit('simpleWebrtcServerApp:taskUpdate', result);
            $uibModalInstance.close(result);
            vm.isSaving = false;
        }

        function onSaveError () {
            vm.isSaving = false;
        }


    }
})();
