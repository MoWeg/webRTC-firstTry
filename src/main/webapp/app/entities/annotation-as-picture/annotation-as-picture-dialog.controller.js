(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('AnnotationAsPictureDialogController', AnnotationAsPictureDialogController);

    AnnotationAsPictureDialogController.$inject = ['$timeout', '$scope', '$stateParams', '$uibModalInstance', 'entity', 'AnnotationAsPicture', 'Scenario'];

    function AnnotationAsPictureDialogController ($timeout, $scope, $stateParams, $uibModalInstance, entity, AnnotationAsPicture, Scenario) {
        var vm = this;

        vm.annotationAsPicture = entity;
        vm.clear = clear;
        vm.save = save;
        vm.scenarios = Scenario.query();

        $timeout(function (){
            angular.element('.form-group:eq(1)>input').focus();
        });

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function save () {
            vm.isSaving = true;
            if (vm.annotationAsPicture.id !== null) {
                AnnotationAsPicture.update(vm.annotationAsPicture, onSaveSuccess, onSaveError);
            } else {
                AnnotationAsPicture.save(vm.annotationAsPicture, onSaveSuccess, onSaveError);
            }
        }

        function onSaveSuccess (result) {
            $scope.$emit('simpleWebrtcServerApp:annotationAsPictureUpdate', result);
            $uibModalInstance.close(result);
            vm.isSaving = false;
        }

        function onSaveError () {
            vm.isSaving = false;
        }


    }
})();
