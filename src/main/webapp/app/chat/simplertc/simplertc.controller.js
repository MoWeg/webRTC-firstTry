(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('SimpleRtcController', SimpleRtcController);

    //SimpleRtcController.$inject = ['$navigator','$window'];

    function SimpleRtcController() {
      //navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia ||
      //navigator.mediaDevices.webkitGetUserMedia || navigator.mediaDevices.mozGetUserMedia;

      navigator.getUserMedia = navigator.getUserMedia ||
      navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      var vm = this;
      var videoSource = null;
      vm.devices = [];

      //var videoDevices = []
      //var switched = false;
      var localVideo = document.querySelector('#firstVideo');
      //var videoSelect = document.querySelector('select#videoSource');
      init();

      function init(){
         //navigator.mediaDevices.enumerateDevices().then(getBackCamera);
        //var videoSource = getBackCamera();
        var constraints = createConstraints();
        navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleError);
        //navigator.getUserMedia(constraints, gotStream, handleError);
      }

      function getBackCamera(devices){
        var devices = []
        var cam = null;
        devices =
        devices.forEach(function(device){
          if(device.kind == 'videoinput'){
              if(device.label.indexOf("back") != -1 || device.label.indexOf("Back") != -1){
                videoSource = device;
              }
          }
        });
      }

      function createConstraints(){
        return {
          //audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
          video: {
                  //width: '640',
                  //height: '400',
                  //deviceId: videoSource ? {exact: videoSource} : undefined
                  facingMode: { exact: "environment" }
                }
          };
      }

      function gotStream(stream) {
        //video.srcObject = stream;
        localVideo.srcObject = stream;
      }

      function handleError(error) {
        console.log('navigator.getUserMedia error: ', error);
      }

 /*
      select();

      function select() {
        if (window.stream) {
          window.stream.getTracks().forEach(function(track) {
            track.stop();
          });
        }
        //var audioSource = audioInputSelect.value;
        var videoSource = videoSelect.value;
        var constraints = {
          //audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
          video: {
                  width: '640',
                  height: '400',
                  deviceId: videoSource ? {exact: videoSource} : undefined
                }
        };
        navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).catch(handleError);
      }

      function gotStream(stream) {
        window.stream = stream; // make stream available to console
        video.srcObject = stream;
        // Refresh button list in case labels have become available
        return navigator.mediaDevices.enumerateDevices();
      }

      function gotDevices(devices) {
        devices.forEach(function(device) {
          vm.devices.push(device);
          if(device.label != null && angular.isDefined(device.label) && device.label!=''){
            if(device.kind == 'videoinput'){
                videoDevices.push(device);
              }
            }
          });
          createVideoSelector();
      }
      function createVideoSelector(){
        videoDevices.forEach(function(device){
          var option = document.createElement('option');
          option.value = device.deviceId;
          device.text = device.label;
          videoSelect.appendChild(option);
        });
      }
      function handleError(error) {
        console.log('navigator.getUserMedia error: ', error);
      }
      */
    }
})();
