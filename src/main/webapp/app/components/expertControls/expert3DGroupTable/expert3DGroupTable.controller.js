(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('Expert3DGroupTableController', Expert3DGroupTableController);

    Expert3DGroupTableController.$inject = ['$scope', 'JhiTrackerService'];

    function Expert3DGroupTableController($scope, JhiTrackerService) {
      var vm = this;

      vm.activeGroup = $scope.activegroup;
      vm.groups = [];
      vm.groups.push(vm.activeGroup)

      vm.addGroup = function(){
        vm.groups.push({
          name: "random",
          active: false,
          visible: false,
          send: false,
          visibleForUser: false,
          objects: [],
          sprites: []
        });
      }

      vm.setActive = function (group) {
        angular.forEach(vm.groups, function(value, key) {
          value.active = false;
        });
        group.active = !group.active;
        vm.activeGroup = group;
      }
      vm.setVisible = function (group) {
        group.visible = !group.visible;
      }
      vm.setVisibleForUser = function (group) {
        group.visibleForUser = !group.visibleForUser;
      }
      vm.send = function (group) {
        group.send = true;
      }
      vm.discard = function (index) {
        vm.groups.splice(index, 1);
      }
    }
})();
