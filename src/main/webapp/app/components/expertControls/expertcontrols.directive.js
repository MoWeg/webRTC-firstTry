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
              expertcamera: '='
            },
            controllerAs: 'vm',
            controller: 'ExpertControlsController'
        };

        return directive;
    }

})();
