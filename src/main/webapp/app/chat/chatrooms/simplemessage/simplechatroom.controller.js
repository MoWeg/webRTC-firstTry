(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('SimpleChatRoomController', SimpleChatRoomController);

    SimpleChatRoomController.$inject = ['$rootScope','$cookies', '$http','JhiTrackerService'];

    function SimpleChatRoomController($rootScope, $cookies, $http, JhiTrackerService) {
      var vm = this;

      vm.receivedMessages = [];
      vm.sendMessage = sendMessage;

      JhiTrackerService.reveiceFromUser().then(null, null, function(send) {
          vm.receivedMessages.push(send);
      });

      JhiTrackerService.receiveInvite().then(null, null, function(received) {
          vm.receivedMessages.push(received);
      });

      function sendMessage() {
        JhiTrackerService.sendSimpleMessageToUser($rootScope.partnerIdForChat, vm.message);
        vm.message = null;
      }
    }
})();
