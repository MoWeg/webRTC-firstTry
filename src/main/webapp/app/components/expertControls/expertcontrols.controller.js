(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('ExpertControlsController', ExpertControlsController);

    ExpertControlsController.$inject = ['$scope'];

    function ExpertControlsController($scope) {
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
