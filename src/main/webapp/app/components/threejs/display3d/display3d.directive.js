(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .directive('display3d', display3d);

    function display3d() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/threejs/display3d/display3d.html',
            scope: {
                reqclass: '@',
                usercam: '=',
                expertcam: '='
            },
            controllerAs: 'vm',
            controller: 'Display3DController'
        };

        return directive;
    }

})();