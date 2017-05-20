(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('SimpleDrawController', SimpleDrawController);

    SimpleDrawController.$inject = ['$rootScope','JhiTrackerService'];

    function SimpleDrawController( $rootScope, JhiTrackerService) {
      var vm = this;
      var recentlyPainted = [];
      var canvasContext = null;

      vm.receivedMessages = [];
      vm.sendMessage = sendMessage;

      var container = document.getElementById('drawingCanvas');
      init(container, container.clientWidth, 500, '#ddd');

      JhiTrackerService.reveiceFromUser().then(null, null, function(send) {
          //vm.receivedMessages.push(send);

      });

      JhiTrackerService.receiveInvite().then(null, null, function(received) {
          //vm.receivedMessages.push(received);
          receivePaintingInfo(received);
      });

      function sendMessage() {
        JhiTrackerService.sendSimpleMessageToJsonUser($rootScope.partnerIdForChat, {'paint': recentlyPainted});
        recentlyPainted = [];
      }


      function createCanvas(parent, width, height) {
        var canvas = {};
        canvas.node = document.createElement('canvas');
        canvas.context = canvas.node.getContext('2d');
        canvas.node.width = width || 100;
        canvas.node.height = height || 100;
        parent.appendChild(canvas.node);
        return canvas;
    }

    function init(container, width, height, fillColor) {
        var canvas = createCanvas(container, width, height);
        var ctx = canvas.context;
        canvasContext = ctx;
        // define a custom fillCircle method
        ctx.fillCircle = function(x, y, radius, fillColor) {
            this.fillStyle = fillColor;
            this.beginPath();
            this.moveTo(x, y);
            this.arc(x, y, radius, 0, Math.PI * 1, false);
            this.fill();
        };
        ctx.clearTo = function(fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fillRect(0, 0, width, height);
        };
        ctx.clearTo(fillColor || "#ddd");

        // bind mouse events
        canvas.node.onmousemove = function(e) {
            if (!canvas.isDrawing) {
               return;
            }
            var x = e.pageX - this.offsetLeft;
            var y = e.pageY - this.offsetTop;
            var radius = 10; // or whatever
            var fillColor = '#ff0000';
            ctx.fillCircle(x, y, radius, fillColor);
            savePaintedInfo(x, y, radius, fillColor);
        };
        canvas.node.onmousedown = function(e) {
            canvas.isDrawing = true;
        };
        canvas.node.onmouseup = function(e) {
            canvas.isDrawing = false;
            sendMessage();
        };
    }

    function savePaintedInfo(x, y, radius, fillColor){
      var paintDto = createPaintDto(x, y, radius, fillColor);
      var alreadyInArray = false;
      angular.forEach(recentlyPainted, function(value, i){
        if(paintDto.x == value.x && paintDto.y == value.y){
          alreadyInArray = true;
          return;
        }
      });
      if(!alreadyInArray){
          recentlyPainted.push(paintDto);
      }
    }

    function createPaintDto(x, y, radius, fillColor){
      return {
        'x': x,
        'y': y,
        'radius': radius,
        'fillColor': fillColor
      };
    }

    function receivePaintingInfo(message){
      angular.forEach(message.paint, function(value, i){
        canvasContext.fillCircle(value.x, value.y, value.radius, value.fillColor);
      });
    }
    }
})();
