(function() {
    'use strict';
    angular
        .module('simpleWebrtcServerApp')
        .factory('AnnotationAsPictureFile', AnnotationAsPictureFile);

    AnnotationAsPictureFile.$inject = ['$http'];

    function AnnotationAsPictureFile($http) {
        var resourceUrl = 'api/annotation-as-pictures/file';

        var factory = {
            uploadFile: uploadFile
        }
        return factory;

        function uploadFile(formData, onSuccess, onError) {
            $http.post(resourceUrl, formData, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                })
                .then(
                    onSuccess, onError
                );
        };
    }
})();