(function() {
    'use strict';
    /* globals SockJS, Stomp */

    angular
        .module('simpleWebrtcServerApp')
        .factory('ChatRoomService', ChatRoomService);

    ChatRoomService.$inject = [ '$resource'];

    function ChatRoomService ( $resource) {
      //return $reource();
    }
})();
