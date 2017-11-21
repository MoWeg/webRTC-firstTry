(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('Display3dController', Display3dController);

    Display3dController.$inject = ['$scope'];

    function Display3dController($scope) {
      var vm = this;

      vm.activegroup = {
        active: true,
        visible: false,
        send: false,
        visibleForUser: false,
        objects: [$scope.plane],
        sprites: []
      };
    }
})();
