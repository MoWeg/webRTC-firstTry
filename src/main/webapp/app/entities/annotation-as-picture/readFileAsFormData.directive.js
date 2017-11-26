(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .directive('readFileAsFormData', readFileAsFormData);

    readFileAsFormData.$inject = ['$q'];

    function readFileAsFormData($q) {
        var slice = Array.prototype.slice;
        var directive = {
            restrict: 'A',
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {
                if (!ngModel) return;

                ngModel.$render = function() {};

                element.bind('change', function(e) {
                    scope.$emit('reading-file');
                    var element = e.target;

                    $q.all(slice.call(element.files, 0).map(readFile))
                        .then(function(values) {
                            if (element.multiple) ngModel.$setViewValue(values);
                            else ngModel.$setViewValue(values.length ? values[0] : null);
                        });

                    function readFile(file) {
                        var formData = new FormData();
                        formData.append('file', file);
                        scope.$emit('reading-file-done');
                        return formData;
                        // return {
                        //   Content-Disposition: formData.get('file'),
                        //   Content-Type: formData.get('file').type
                        // };
                    }

                }); //change

            } //link
        };

        return directive;
    }

})();