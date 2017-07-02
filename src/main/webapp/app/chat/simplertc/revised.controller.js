(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('RevisedSimpleRtcController', RevisedSimpleRtcController);

    RevisedSimpleRtcController.$inject = ['UserMediaService'];

    function RevisedSimpleRtcController(UserMediaService) {
      var vm = this;
      var videoSource = null;
      vm.devices = [];

      //var videoDevices = []
      //var switched = false;
      var localVideo = document.querySelector('#firstVideo');
      //var videoSelect = document.querySelector('select#videoSource');
      init();

      function init(){
         UserMediaService.getBackCameraAsPromise().then(gotStream).catch(handleError);
        //navigator.getUserMedia(constraints, gotStream, handleError);
      }

      function gotStream(stream) {
        //video.srcObject = stream;
        localVideo.srcObject = stream;
      }

      function handleError(error) {
        console.log('navigator.getUserMedia error: ', error);
      }
    }
})();
