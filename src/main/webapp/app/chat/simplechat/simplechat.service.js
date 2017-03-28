(function() {
    'use strict';
    /* globals SockJS, Stomp */

    angular
        .module('simpleWebrtcServerApp')
        .factory('SimpleChatService', SimpleChatService);

    SimpleChatService.$inject = ['$rootScope', '$window', '$cookies', '$http', '$q'];

    function SimpleChatService ($rootScope, $window, $cookies, $http, $q) {
        var stompClient = null;
        var subscriber = null;
        var listener = $q.defer();
        var connected = $q.defer();
        var alreadyConnectedOnce = false;

        var service = {
            connect: connect,
            disconnect: disconnect,
            receive: receive,
            sendSimpleMessage: sendSimpleMessage,
            subscribe: subscribe,
            unsubscribe: unsubscribe
        };

        return service;

        function connect () {
            //stompClient = MySocketService.getStompClient;
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

        function disconnect () {
            if (stompClient !== null) {
                stompClient.disconnect();
                stompClient = null;
            }
        }

        function receive () {
            return listener.promise;
        }

        function sendSimpleMessage(message) {
            if (stompClient !== null && stompClient.connected) {
                stompClient
                    .send('/topic/sendsimple',
                    {},
                    angular.toJson({'content': message}));
            }
        }

        function subscribe () {
            if (stompClient == null) {
                connect();
            }
            connected.promise.then(function() {
                subscriber = stompClient.subscribe('/topic/receivesimple', function(data) {
                    listener.notify(angular.fromJson(data.body));
                });
            }, null, null);
        }

        function unsubscribe () {
            if (subscriber !== null) {
                subscriber.unsubscribe();
            }
            listener = $q.defer();
        }
    }
})();
