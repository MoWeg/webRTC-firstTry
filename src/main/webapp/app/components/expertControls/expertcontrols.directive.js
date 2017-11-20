(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .directive('expertcontrols', expertcontrols);

    function expertcontrols () {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/expertControls/expertcontrols.html',
            scope: {
              scene: '=',
              raycaster: '=',
              rollovermesh: '=',
              gridhelper: '=',
              expertcamera: '=',
              plane: '='
            },
            controllerAs: 'vm',
            controller: 'ExpertControlsController'
        };

        return directive;
    }

})();
