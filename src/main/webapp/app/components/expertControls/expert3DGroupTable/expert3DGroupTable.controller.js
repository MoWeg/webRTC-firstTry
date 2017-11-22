(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('Expert3DGroupTableController', Expert3DGroupTableController);

    Expert3DGroupTableController.$inject = ['$scope', '$rootScope', 'JhiTrackerService', 'ThreejsSceneService'];

    function Expert3DGroupTableController($scope, $rootScope, JhiTrackerService, ThreejsSceneService) {
      var vm = this;
      var plane = ThreejsSceneService.getPlane();
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
        animate();
      }
      vm.setVisibleForUser = function (group) {
        group.visibleForUser = !group.visibleForUser;
        if(group.send){
          var groupDto = { id: group.id, visibleForUser: group.visibleForUser};
          var initialMessage = {goal: '3d', content: 'visibility', group:groupDto};
          sendMessage(initialMessage);
        }
        animate();
      }
      vm.send = function (group) {
        var groupDto = { id: group.id, visibleForUser: group.visibleForUser};
        var initialMessage = {goal: '3d', content: 'insert', group:groupDto};
        sendMessage(initialMessage);
        angular.forEach(group.messages, function(message){
          sendMessage(message);
        });
        group.send = true;
      }
      vm.discard = function (index, group) {
        if(group.send){
          var groupDto = { id: group.id, visibleForUser: group.visibleForUser};
          var initialMessage = {goal: '3d', content: 'discard', group:groupDto};
          sendMessage(initialMessage);
        }
        ThreejsSceneService.removeGroupFromScene(group);
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
        this.messages = [];
      }

      function animate() {
        $rootScope.$broadcast('request-animation', $scope.threejsgroups);
      }
      function sendMessage(message){
          JhiTrackerService.sendSimpleMessageToJsonUser($rootScope.partnerIdForChat, message);
      }
    }
})();
