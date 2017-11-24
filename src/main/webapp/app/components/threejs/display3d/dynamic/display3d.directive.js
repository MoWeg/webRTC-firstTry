(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .directive('display3ddynamic', display3ddynamic);

    function display3ddynamic() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/threejs/display3d/dynamic/display3d.html',
            scope: {
                reqclass: '@',
                primarycam: '='
            },
            controllerAs: 'vm',
            controller: 'Display3DDynamicController'
        };

        return directive;
    }

})();