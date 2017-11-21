(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('Expert3DGroupTableController', Expert3DGroupTableController);

    Expert3DGroupTableController.$inject = ['$scope', '$rootScope', 'JhiTrackerService'];

    function Expert3DGroupTableController($scope, $rootScope, JhiTrackerService) {
      var vm = this;
      var plane = $scope.plane;
      vm.groups = $scope.threejsgroups;

      vm.addGroup = function () {
        var groupId = Math.round((Math.random() * 1000000) * 10);
        var newGroup = new Group(groupId, false);
        newGroup.objects.push(plane);
        vm.groups.push(newGroup);
      }

      vm.setActive = function (group) {
        angular.forEach(vm.groups, function(value, key) {
          value.active = false;
        });
        group.active = true;
        vm.activeGroup = group;
        $rootScope.$broadcast('active-group-changed', group);
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

      function Group(groupId, active){
        this.id = groupId
        this.active = active;
        this.visible = false;
        this.send = false;
        this.visibleForUser = false;
        this.objects = [];
        this.sprites = [];
      }

    }
})();
