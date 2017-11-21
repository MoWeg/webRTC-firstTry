(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('Proto3D1on1ExpertController', Proto3D1on1ExpertController);

    Proto3D1on1ExpertController.$inject = ['$rootScope', '$scope', '$state', 'JhiTrackerService', 'SdpService', 'OrientationCalculator', 'ThreejsSceneService'];

    function Proto3D1on1ExpertController($rootScope, $scope, $state, JhiTrackerService, SdpService, OrientationCalculator, ThreejsSceneService) {
      var vm = this;

      var views = [];
      var sprites = [];
      var spriteMap = new THREE.TextureLoader().load( "content/images/logo-jhipster.png" );
      var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, transparent:true} );

      var isStarted = false;
      var gotOffer = false;
      var pc;
      var remoteStream;
      var turnReady;

      var container;
      var cube;
      var mouse, isShiftDown = false;
      var rollOverMaterial;
      var cubeGeo = new THREE.BoxGeometry( 50, 50, 50 );
      var cubeMaterial;
      var objects = [];
      var viewWithCamera;
      var viewWithoutCamera;
      vm.view2Cam;
      var view1CamHelper;
      vm.scene;
      vm.raycaster;
      vm.gridHelper;
      vm.rollOverMesh;
      vm.plane;
      var newPosY = 0;
      var threejsgroups;

      var oldVideoHeight = 0;
      var oldVideoWidth = 0;

      //var pc_config = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'},{'url': 'stun:stun4.l.google.com:19302'},{'url': 'stun:stun1.l.google.com:19302'},{'url': 'stun:stun01.sipphone.com'},{'url': 'stun1.voiceeclipse.net'}]};
      var pc_config = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}; //, stun:stun4.l.google.com:19302, stun:stun1.l.google.com:19302, stun:stun01.sipphone.com
      var pc_constraints = {'optional': [{'DtlsSrtpKeyAgreement': true}]};

      // Set up audio and video regardless of what devices are present.
      var sdpConstraints = {'mandatory': {
        'OfferToReceiveAudio':true,
        'OfferToReceiveVideo':true }};

      var remoteVideo = document.querySelector('#video');
      var innerContainer = document.querySelector('#videos')
      //Signaling
      /////////////////////////////////////////////

      function sendMessage(message){
          JhiTrackerService.sendSimpleMessageToJsonUser($rootScope.partnerIdForChat, message);
      }

      JhiTrackerService.receiveInvite().then(null, null, function(received) {
          handleContent(received);
      });

      $scope.$on('$destroy', function() {
        hangup();
      });
      $scope.$on('request-animation', function(event, args) {
        threejsgroups = args;
        animate();
      });

      init3D();
      $scope.$watch(remoteVideo, function(oldval, newval){
          //resize3dModell(remoteVideo.videoHeight, remoteVideo.videoWidth);
          console.log('height: '+ remoteVideo.videoHeight +' width: '+remoteVideo.videoWidth);
      }, true);

      remoteVideo.addEventListener('resize', resize3dModell(remoteVideo.videoHeight, remoteVideo.videoWidth));

      function handleContent (message){
         //console.log('Client received message:', message);
         if (message.type === 'offer') {
            gotOffer = true;
            if (!isStarted) {
              maybeStart();
            }
            pc.setRemoteDescription(new RTCSessionDescription(message));
            doAnswer();
          } else if (message.type === 'candidate') {
            if(isStarted && gotOffer){
              var candidate = new RTCIceCandidate({
                sdpMLineIndex: message.label,
                candidate: message.candidate
              });
              pc.addIceCandidate(candidate);
            } else{
              if (!isStarted) {
                maybeStart();
              }
              if (!gotOffer) {
                sendMessage({
                  goal: 'rtc',
                  content: 'needOffer'
                });
              }
            }
          } else if (message.content === 'bye' && isStarted && gotOffer) {
            handleRemoteHangup();
          } else if(message.goal == '3d'){
            if(message.content == 'camera'){
                setCamera(message.orientation);
          }
        }
      }

      if (location.hostname != "localhost") {
        console.log('would request turn');
        //requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
      }

      function maybeStart() {
        console.log('maybeStart:')
        if (!isStarted) {
          createPeerConnection();
          isStarted = true;
        }
      }


      function createPeerConnection() {
        try {
            pc = new RTCPeerConnection(pc_config);
            pc.onicecandidate = handleIceCandidate;
            pc.onaddstream = handleRemoteStreamAdded;
            pc.onremovestream = handleRemoteStreamRemoved;
            console.log('Created RTCPeerConnnection');
          } catch (e) {
            console.log('Failed to create PeerConnection, exception: ' + e.message);
            alert('Cannot create RTCPeerConnection object.');
            return;
          }
        }

        function handleIceCandidate(event) {
          if (event.candidate) {
            sendMessage({
              goal: 'rtc',
              type: 'candidate',
              label: event.candidate.sdpMLineIndex,
              id: event.candidate.sdpMid,
              candidate: event.candidate.candidate});
          } else {
            console.log('End of candidates.');
          }
        }

        function handleRemoteStreamAdded(event) {

          console.log('Remote stream added.');
          remoteVideo.src = window.URL.createObjectURL(event.stream);
          remoteStream = event.stream;
          //resize3dModell(remoteVideo.height, remoteVideo.width);
        }

        function handleCreateAnswerError(event){
          console.log('createAnswer() error: ', e);
        }

        function doAnswer() {
          console.log('Sending answer to peer.');
          pc.createAnswer(setLocalAndSendMessage, handleCreateAnswerError, sdpConstraints);
        }

        function setLocalAndSendMessage(sessionDescription) {
          // Set Opus as the preferred codec in SDP if Opus is present.
          if(sessionDescription.sdp != null && angular.isDefined(sessionDescription.sdp)){
            var oldSdp = sessionDescription.sdp
            sessionDescription.sdp = preferOpus(oldSdp);
          }
          pc.setLocalDescription(sessionDescription);
          console.log('setLocalAndSendMessage sending message' , sessionDescription);
          sendMessage(sessionDescription);
        }

        function requestTurn(turn_url) {
          var turnExists = false;
          for (var i in pc_config.iceServers) {
            if (pc_config.iceServers[i].url.substr(0, 5) === 'turn:') {
              turnExists = true;
              turnReady = true;
              break;
            }
          }
          if (!turnExists) {
            console.log('Getting TURN server from ', turn_url);
            // No TURN server. Get one from computeengineondemand.appspot.com:
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function(){
              if (xhr.readyState === 4 && xhr.status === 200) {
                var turnServer = JSON.parse(xhr.responseText);
                console.log('Got TURN server: ', turnServer);
                pc_config.iceServers.push({
                'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
                'credential': turnServer.password
                });
                turnReady = true;
              }
            };
            xhr.open('GET', turn_url, true);
            xhr.send();
          }
        }

        function handleRemoteStreamAdded(event) {
          console.log('Remote stream added.');
          remoteVideo.src = window.URL.createObjectURL(event.stream);
          remoteStream = event.stream;
        }

        function handleRemoteStreamRemoved(event) {
          console.log('Remote stream removed. Event: ', event);
        }

        function hangup() {
          console.log('Hanging up.');
          sendMessage({goal: 'rtc', content:'bye'});
          stop();
        }

        function handleRemoteHangup() {
          console.log('Session terminated.');
          stop();
          $state.go('chooseroom');
        }

        function stop() {
          isStarted = false;
        // isAudioMuted = false;
        // isVideoMuted = false;
          pc.close();
          pc = null;
          //UserMediaService.closeAllStreams(localStream);
        }

        ///////////////////////////////////////////

        // Set Opus as the default audio codec if it's present.
        function preferOpus(sdp) {
            return SdpService.getOpus(sdp);
          }
          //////////////////////////////////////////////////////////////////////////////////
          // 3D////////////////////////////////////////////////
        function init3D(){
            vm.scene = ThreejsSceneService.getScene();
            vm.raycaster = ThreejsSceneService.getRayCaster();
            vm.plane = ThreejsSceneService.getPlane();


            var canvas1 = document.getElementById( 'canvas1' );
            var canvas2 = document.getElementById( 'canvas2' );

            var w = 640, h = 640;
            var fullWidth = w * 2;
            var fullHeight = h * 2;
            canvas2.width = fullWidth;
            canvas2.height = fullHeight;

            var userCam = ThreejsSceneService.getCamera(400,640,1,10000,500,800,1300);
            var userView = ThreejsSceneService.getView(canvas1, 400, 640, userCam, true, 0x000000, 0);
            viewWithCamera = userView;

            var expertCam = ThreejsSceneService.getCamera(w,h,1,30000, 900, 900, 1600);
            var expertView = ThreejsSceneService.getView(canvas2, w, h, expertCam, false, 0xffffff, 1, userCam);

            vm.view2Cam = expertCam;

            ThreejsSceneService.getHelperPromise().then(function(helpers) {
              angular.forEach(helpers, function(value, key){
                if(value.name == 'cursor'){
                  vm.rollOverMesh =  value.object;
                }
                if(value.name == 'grid'){
                    vm.gridHelper =  value.object;
                }
              });
            });

            views.push(userView);
            views.push(expertView);
            animate();
          }

          function animate(){
            angular.forEach(views, function(view) {
              view.render(threejsgroups);
            });
          }

          function setCamera(deviceEvent){
            checkResize();
            var orientationInfo = OrientationCalculator.calculateOrientation(deviceEvent, null);
            viewWithCamera.setOrientationInfo(orientationInfo);
            animate();
          }

          function resize3dModell(height, width){
            if(height != null){
              innerContainer.height = height;
            } else {
              height = innerContainer.height;
            }
            if(width != null){
              innerContainer.width = width;
            }else{
              width = innerContainer.width;
            }

            viewWithCamera.setNewSize(width, height);
          }
          function checkResize() {
            var height = remoteVideo.videoHeight;
            var width = remoteVideo.videoWidth;
            if(height != oldVideoHeight||width != oldVideoWidth){
              resize3dModell(height, width);
              oldVideoHeight = height;
              oldVideoWidth = width;
            }
          }
    }
})();
