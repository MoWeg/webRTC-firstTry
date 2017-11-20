(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('Expert3DGroupTableController', Expert3DGroupTableController);

    Expert3DGroupTableController.$inject = ['$scope', 'JhiTrackerService'];

    function Expert3DGroupTableController($scope, JhiTrackerService) {
      var vm = this;
      var plane = $scope.plane;
      vm.activeGroup = $scope.activegroup;
      vm.groups = [];
      vm.groups.push(vm.activeGroup)

      vm.addGroup = function(){
        var newGroup = new Group();
        newGroup.objects.push(plane);
        vm.groups.push(newGroup);
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

      function Group(){
        this.active = false;
        this.visible = false;
        this.send = false;
        this.visibleForUser = false;
        this.objects = [];
        this.sprites = [];
      }
    }
})();
