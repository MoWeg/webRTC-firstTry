(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('Proto3D1on1Controller', Proto3D1on1Controller);

    Proto3D1on1Controller.$inject = ['$rootScope', '$scope', '$state', 'JhiTrackerService', 'SdpService', 'OrientationCalculator','UserMediaService', 'ThreejsSceneService', 'AnnotationToolService'];

    function Proto3D1on1Controller($rootScope, $scope, $state, JhiTrackerService, SdpService, OrientationCalculator, UserMediaService, ThreejsSceneService, AnnotationToolService) {
      var vm = this;
      //var isChannelReady;
      var isInitiator = $rootScope.isInitiator;
      var isStarted = false;
      var gotAnswer = false;
      var localStream;
      var pc;
      var remoteStream;
      var turnReady;
      var storedOffer = null;

      // 3D stuff
      vm.userCam = ThreejsSceneService.getUserCamera();
      var container;
      var tools;
      var groups = [];
      var lastGroup;
      var scene, camera, view;
      // var view;
      // var camera, scene, renderer;
      // var plane, cube;
      // var mouse, raycaster, isShiftDown = false;
      // var rollOverMesh, rollOverMaterial;
      // var cubeGeo = new THREE.BoxGeometry( 50, 50, 50 );
      // var cubeMaterial;
      // var objects = [];
      // var sprites = [];
      // var textureLoader = new THREE.TextureLoader();

      var oldVideoHeight = 0;
      var oldVideoWidth = 0;


      //var pc_config = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'},{'url': 'stun:stun4.l.google.com:19302'},{'url': 'stun:stun1.l.google.com:19302'},{'url': 'stun:stun01.sipphone.com'},{'url': 'stun1.voiceeclipse.net'}]};
      var pc_config = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}; //, stun:stun4.l.google.com:19302, stun:stun1.l.google.com:19302, stun:stun01.sipphone.com
      var pc_constraints = {'optional': [{'DtlsSrtpKeyAgreement': true}]};

      // Set up audio and video regardless of what devices are present.
      var sdpConstraints = {'mandatory': {
        'OfferToReceiveAudio':true,
        'OfferToReceiveVideo':false }};


      var localVideo = document.querySelector('#video');
      var innerContainer = document.querySelector('#videos');

      $scope.$on('$destroy', function() {
        hangup();
      });

      UserMediaService.getBackCameraAsPromise().then(handleUserMedia).catch(handleUserMediaError);

      init3D();
      // $scope.$watch(videoHeight, function(oldval, newval){
      //     resize3dModell(localVideo.videoHeight, null);
      // }, true);
      // $scope.$watch(videoWidth, function(oldval, newval){
      //     resize3dModell(null, localVideo.videoWidth);
      // }, true);
      localVideo.addEventListener('resize', resize3dModell(localVideo.videoHeight,  localVideo.videoWidth));

      //Signaling
      /////////////////////////////////////////////

      JhiTrackerService.receiveInvite().then(null, null, function(received) {
          handleContent(received);
      });

      function sendMessage(message){
          JhiTrackerService.sendSimpleMessageToJsonUser($rootScope.partnerIdForChat, message);
      }

      function handleContent (message){
          if (message.type === 'answer' && isStarted) {
            pc.setRemoteDescription(new RTCSessionDescription(message));
            gotAnswer = true;
          } else if (message.type === 'candidate' && isStarted && gotAnswer) {
            var candidate = new RTCIceCandidate({
              sdpMLineIndex: message.label,
              candidate: message.candidate
          });
          pc.addIceCandidate(candidate);
          } else if (message.content === 'bye' && isStarted && gotAnswer) {
            handleRemoteHangup();
          } else if (message.content == 'needOffer'){
            sendMessage(storedOffer);
          } else if(message.goal == '3d'){
            handleMessageWith3dGoal(message);
          }
      }

      ////////////////////////////////////////////////////
      function handleUserMedia(stream) {
        console.log('initializing 3D model');

        console.log('Adding local stream.');
        localVideo.src = window.URL.createObjectURL(stream);
        localStream = stream;
        //init3D();
        //resize3dModell(localVideo.height, localVideo.width);
        if (!isStarted && typeof localStream != 'undefined') {
          createPeerConnection();
          pc.addStream(localStream);
          isStarted = true;
          console.log('isInitiator', isInitiator);
          if (isInitiator) {
            doCall();
          }
        }
      }

      function handleUserMediaError(error){
        console.log('getUserMedia error: ', error);
      }



      if (location.hostname != "localhost") {
        console.log('would request turn');
        //requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
      }



/////////////////////////////////////////////////////////

    function createPeerConnection() {
      try {
        pc = new RTCPeerConnection(pc_config);
        pc.onicecandidate = handleIceCandidate;
        pc.onaddstream = handleRemoteStreamAdded;
        pc.onremovestream = handleRemoteStreamRemoved;
        console.log('Created RTCPeerConnnection');
      } catch (e) {
        console.log('Failed to create PeerConnection, exception: ' + e.message);
        //alert('Cannot create RTCPeerConnection object.');
        return;
      }
    }

    function handleIceCandidate(event) {
      console.log('handleIceCandidate event: ', event);
      if (event.candidate) {
        sendMessage({
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
      //remoteVideo.src = window.URL.createObjectURL(event.stream);
      //remoteStream = event.stream;
    }

    function handleCreateOfferError(event){
      console.log('createOffer() error: ', e);
    }


    function doCall() {
      console.log('Sending offer to peer.');
      pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
    }

    function setLocalAndSendMessage(sessionDescription) {
      // Set Opus as the preferred codec in SDP if Opus is present.
      if(sessionDescription.sdp != null && angular.isDefined(sessionDescription.sdp)){
        var oldSdp = sessionDescription.sdp
        sessionDescription.sdp = preferOpus(oldSdp);
      }
      pc.setLocalDescription(sessionDescription);
      console.log('setLocalAndSendMessage sending message' , sessionDescription);
      storedOffer = sessionDescription;
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

    function hangup() {
      console.log('Hanging up.');
      sendMessage({goal: 'rtc', content:'bye'});
      stop();
    }

    function handleRemoteHangup() {
      console.log('Session terminated.');
      stop();

      $state.go('chooseroom');
      // isInitiator = false;
    }

    function stop() {
      isStarted = false;
      // isAudioMuted = false;
      // isVideoMuted = false;
      pc.close();
      pc = null;
      localVideo.pause();
      localVideo.src = "";
      UserMediaService.closeAllStreams(localStream);
    }

    function preferOpus(sdp){
      return SdpService.getOpus(sdp);
    }
    //////////////////////////////////////////////////////////////////////////////////
  
      function init3D(){
        window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

        var toolRequest = [];
        toolRequest.push({name:'insert box', type:'box', spriteLocation: null});
        toolRequest.push({name:'insert arrow', type:'arrow', spriteLocation: null});
        toolRequest.push({name:'insert jHipster', type:'sprite', spriteLocation: 'content/images/logo-jhipster.png'});
        tools = AnnotationToolService.getAnnotationTools(toolRequest);
      }

      //handle orientation and resize
      function onDeviceOrientationChangeEvent(deviceEvent){
        sendOrientation(createDeviceOrientationDto(deviceEvent));
        setCamera(deviceEvent);
      }
      function createDeviceOrientationDto(event){
        return {
          'alpha': event.alpha,
          'beta': event.beta,
          'gamma': event.gamma
        };
      }

      function sendOrientation(newOrientation) {
        JhiTrackerService.sendSimpleMessageToJsonUser($rootScope.partnerIdForChat, {goal:'3d', content:'camera' ,orientation: newOrientation});
      }

      function checkResize() {
        var height = localVideo.videoHeight;
        var width = localVideo.videoWidth;
        if(height != oldVideoHeight||width != oldVideoWidth){
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
          resize3dModell(height, width);
          oldVideoHeight = height;
          oldVideoWidth = width;

          return {height: heigth, width: width};
        }
      }

      function setCamera(deviceEvent){
        var size = checkResize();
        $rootScope.$broadcast('set-camera-and-resize', {deviceEvent: deviceEvent, size:size})
      }

      function resize3dModell(height, width){
          $rootScope.$broadcast('just-resize', {height: height, width:width})
      }

      /// handle 3D messages
      function handleMessageWith3dGoal(message){
        var foundGroup

        if(lastGroup){
          if(lastGroup.id ==  message.group.id){
            foundGroup = lastGroup;
          }
        }

        if(!foundGroup){
          angular.forEach(groups, function(group){
            if(group.id == message.group.id){
                foundGroup = group;
            }
          });
        }
        if(foundGroup){
          switch(message.content){
            case 'visiblity': foundGroup.visibleForUser = message.group.visibleForUser; break;
            case 'discard': discardGroup(foundGroup); break;
            default: insertWithTool([message.voxel, message.endPoint], scene, lastGroup, message.content, message.type);
          }
          lastGroup = foundGroup;
          animate();
        } else {
            var group = new Group(message.group);
            groups.push(group);
            lastGroup = group;
            if(message.content != 'insert'){
              handleMessageWith3dGoal(message);
            }
        }
      }
      function insertWithTool(voxelDtos, scene, group, type, location){
        angular.forEach(tools, function(tool){
            if(tool.type == type && tool.location == location){
              tool.actionManager.handleInsert(voxelDtos, scene, group);
            }
        });
      }

      function discardGroup(group) {
        ThreejsSceneService.removeGroupFromScene(group);
        var index = groups.indexOf(group);
        groups.splice(index, 1);
      }

      function Group(groupDto){
        this.id = groupDto.id;
        this.visibleForUser = groupDto.visibleForUser;
        this.objects = [];
        this.sprites = [];
      }

    }
})();
