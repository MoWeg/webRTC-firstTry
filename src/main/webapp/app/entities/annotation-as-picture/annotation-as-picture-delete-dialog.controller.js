(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('AnnotationAsPictureDeleteController',AnnotationAsPictureDeleteController);

    AnnotationAsPictureDeleteController.$inject = ['$uibModalInstance', 'entity', 'AnnotationAsPicture'];

    function AnnotationAsPictureDeleteController($uibModalInstance, entity, AnnotationAsPicture) {
        var vm = this;

        vm.annotationAsPicture = entity;
        vm.clear = clear;
        vm.confirmDelete = confirmDelete;

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function confirmDelete (id) {
            AnnotationAsPicture.delete({id: id},
                function () {
                    $uibModalInstance.close(true);
                });
        }
    }
})();
