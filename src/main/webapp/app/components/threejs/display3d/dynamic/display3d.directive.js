(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .directive('display3ddynamic', display3d);

    function display3d() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/threejs/display3d/dynamic/display3d.html',
            scope: {
                reqclass: '@',
                primarycam: '='
            },
            controllerAs: 'vm',
            controller: 'Display3DController'
        };

        return directive;
    }

})();