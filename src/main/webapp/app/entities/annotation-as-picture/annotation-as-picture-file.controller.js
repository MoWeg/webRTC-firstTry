(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('AnnotationAsPictureDialogFileController', AnnotationAsPictureDialogFileController);

    AnnotationAsPictureDialogFileController.$inject = ['$timeout', '$scope', '$stateParams', '$uibModalInstance', 'entity', 'AnnotationAsPictureFile', 'Scenario'];

    function AnnotationAsPictureDialogFileController($timeout, $scope, $stateParams, $uibModalInstance, entity, AnnotationAsPictureFile, Scenario) {
        var vm = this;

        vm.annotationAsPictureFile = entity;
        vm.clear = clear;
        vm.save = save;
        vm.scenarios = Scenario.query();

        $timeout(function() {
            angular.element('.form-group:eq(1)>input').focus();
        });

        function clear() {
            $uibModalInstance.dismiss('cancel');
        }

        function save() {
            if (vm.annotationAsPictureFile.file) {
                var request = vm.annotationAsPictureFile.file;
                // request.append('name', vm.annotationAsPictureFile.name);
                // request.append('toolName', vm.annotationAsPictureFile.toolName);
                vm.isSaving = true;
                // if (vm.annotationAsPictureFile.id !== null) {
                //     AnnotationAsPictureFile.update(vm.annotationAsPictureFile, onSaveSuccess, onSaveError);
                // } else {
                AnnotationAsPictureFile.uploadFile(request, onSaveSuccess, onSaveError);
                // }
            }
        }

        function onSaveSuccess(result) {
            $scope.$emit('simpleWebrtcServerApp:annotationAsPictureUpdate', result);
            $uibModalInstance.close(result);
            vm.isSaving = false;
        }

        function onSaveError() {
            vm.isSaving = false;
        }

    }
})();