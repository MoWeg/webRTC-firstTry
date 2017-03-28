(function() {
    'use strict';
    /* globals SockJS, Stomp */

    angular
        .module('simpleWebrtcServerApp')
        .factory('MySocketService', MySocketService);

    MySocketService.$inject = ['$window', '$cookies', '$http', '$q'];

    function MySocketService ($window, $cookies, $http, $q) {
        var stompClient = null;
        var connected = $q.defer();

        var service = {
            getStompClient: getStompClient,
        };

        return service;

        function getStompClient(){
          if(stompClient == null){
              connect();
          }
          return stompClient;
        }

        function connect () {
            //building absolute path so that websocket doesnt fail when deploying with a context path
            var loc = $window.location;
            var url = '//' + loc.host + loc.pathname + 'websocket/tracker';
            var socket = new SockJS(url);
            stompClient = Stomp.over(socket);
            var stateChangeStart;
            var headers = {};
            headers[$http.defaults.xsrfHeaderName] = $cookies.get($http.defaults.xsrfCookieName);
            stompClient.connect(headers, function() {
                connected.resolve('success');
            });
          }
    }
})();
