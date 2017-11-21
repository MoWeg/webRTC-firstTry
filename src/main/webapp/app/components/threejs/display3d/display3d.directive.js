(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .directive('display3d', display3d);

    function display3d () {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/threejs/display3d.html',
            scope: {
              scene: '=',
              playground: '@'
            },
            controllerAs: 'vm',
            controller: 'Display3dController'
        };

        return directive;
    }

})();
