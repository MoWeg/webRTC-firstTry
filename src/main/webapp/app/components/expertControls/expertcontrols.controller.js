(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('ExpertControlsController', ExpertControlsController);

    ExpertControlsController.$inject = ['$scope', 'ThreejsSceneService'];

    function ExpertControlsController($scope, ThreejsSceneService) {
      var vm = this;

      vm.groups = [];
      var plane = ThreejsSceneService.getPlane();

      function init() {
        var groupId = Math.round((Math.random() * 1000000) * 10);
        var newGroup = new Group(groupId, true);
        newGroup.objects.push(plane);
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
