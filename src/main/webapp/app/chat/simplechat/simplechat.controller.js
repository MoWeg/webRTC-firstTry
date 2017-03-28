(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('SimpleChatController', SimpleChatController);

    SimpleChatController.$inject = ['$cookies', '$http','JhiTrackerService'];

    function SimpleChatController($cookies, $http, JhiTrackerService) {
      var vm = this;

      vm.receivedMessages = [];
      vm.sendMessage = sendMessage;

      JhiTrackerService.receiveSimpleMessage().then(null, null, function(received) {
          receiveMessage(received);
      });

      function receiveMessage(received){
        vm.receivedMessages.push(received);
      }

      function sendMessage() {
        JhiTrackerService.sendSimpleMessage(vm.message);
        vm.message = null;
      }
    }
})();
