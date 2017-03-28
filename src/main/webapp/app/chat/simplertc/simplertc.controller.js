(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('SimpleRtcController', SimpleRtcController);

    //SimpleRtcController.$inject = ['$navigator','$window'];

    function SimpleRtcController() {
      var vm = this;
      var video = document.querySelector('video');
      navigator.getUserMedia = navigator.getUserMedia ||
      navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      var constraints = {
        audio: false,
        video: true
      };

      function successCallback(stream) {
        window.stream = stream; // stream available to console
        if (window.URL) {
          video.src = window.URL.createObjectURL(stream);
        } else {
          video.src = stream;
        }
      }

      function errorCallback(error) {
        console.log('navigator.getUserMedia error: ', error);
      }

      navigator.getUserMedia(constraints, successCallback, errorCallback);
    }

})();
