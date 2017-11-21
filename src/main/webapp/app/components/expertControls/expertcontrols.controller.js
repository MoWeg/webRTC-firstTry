(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('ExpertControlsController', ExpertControlsController);

    ExpertControlsController.$inject = ['$scope'];

    function ExpertControlsController($scope) {
      var vm = this;

      vm.groups = [];

      function init() {
        var groupId = Math.round((Math.random() * 1000000) * 10);
        var newGroup = new Group(groupId, true);
        newGroup.objects.push($scope.plane);
        vm.groups.push(newGroup);
      }

      function Group(groupId, active){
        this.id = groupId
        this.active = active;
        this.visible = true;
        this.send = false;
        this.visibleForUser = false;
        this.objects = [];
        this.sprites = [];
        this.messages = [];
      }
      init();
    }
})();
