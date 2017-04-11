(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('SimpleChatRoomController', SimpleChatRoomController);

    SimpleChatRoomController.$inject = ['$rootScope','$cookies', '$http','SocketChatService'];

    function SimpleChatRoomController($rootScope, $cookies, $http, SocketChatService) {
      var vm = this;

      vm.receivedMessages = [];
      vm.sendMessage = sendMessage;

      SocketChatService.reveiceFromUser().then(null, null, function(send) {
          vm.receivedMessages.push(send);
      });

      SocketChatService.receiveInvite().then(null, null, function(received) {
          vm.receivedMessages.push(received);
      });

      function sendMessage() {
        SocketChatService.sendSimpleMessageToUser($rootScope.partnerIdForChat, vm.message);
        vm.message = null;
      }
    }
})();
