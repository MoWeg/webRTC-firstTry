(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('Proto3D1on1ExpertController', Proto3D1on1ExpertController);

    Proto3D1on1ExpertController.$inject = ['$rootScope', '$scope', '$state', 'JhiTrackerService', 'SdpService', 'OrientationCalculator'];

    function Proto3D1on1ExpertController($rootScope, $scope, $state, JhiTrackerService, SdpService, OrientationCalculator) {
      var vm = this;

      var isStarted = false;
      var gotOffer = false;
      var pc;
      var remoteStream;
      var turnReady;

      var container;
      var scene;
      var plane, cube;
      var mouse, raycaster, isShiftDown = false;
      var rollOverMesh, rollOverMaterial;
      var cubeGeo, cubeMaterial;
      var objects = [];
      var viewWithCamera;
      var viewWithoutCamera;
      var view1CamHelper;

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
                console.log(message.orientation);
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
          console.log('handleIceCandidate event: ', event);
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
          // canvas//navigator.getUserMedia = navigator.getUserMedia ||
          //navigator.webkitGetUserMedia || navigator.mozGetUserMedia;


        //////////////////////////////////////////////////////////////////////////////////
        function View( canvas, viewWidth, viewHeight, inputCamera, inputRenderer,  withHelper) {
          var showHelper = withHelper;
          var renderer = inputRenderer;
          var camera = inputCamera;
          canvas.appendChild(renderer.domElement);

          this.render = function () {
            renderer.render( scene, camera );
          };

          this.setNewSize = function( newWidth, newHeight ){
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth,newHeight);
          };

          this.setOrientationInfo = function(orientationInfo){
            camera.quaternion.setFromEuler(orientationInfo.eulerOrientation);
            camera.quaternion.multiply(orientationInfo.backCamMultiplier);
            camera.quaternion.multiply(orientationInfo.screenAdjustment);
          }
        }

        function init3D(){
            scene = new THREE.Scene();

            var canvas1 = document.getElementById( 'canvas1' );
            var canvas2 = document.getElementById( 'canvas2' );

            var w = 640, h = 640;
            var fullWidth = w * 2;
            var fullHeight = h * 2;

            var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true} );
            renderer.setClearColor( 0x000000, 0 );
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( 400, 640);

            // var renderer2  = new THREE.WebGLRenderer( { antialias: true } );
            // renderer2.setClearColor( 0xffffff );
            // renderer2.setPixelRatio( window.devicePixelRatio );
            // renderer2.setSize( 640, 640 );


            var view1Cam = new THREE.PerspectiveCamera( 45, 400 / 640, 1, 10000 );
            view1Cam.position.set( 500, 800, 1300 );
            view1Cam.lookAt( new THREE.Vector3() );

            viewWithCamera = new View( canvas1, 400, 640, view1Cam, renderer, false );

            // view2Cam = new THREE.PerspectiveCamera( 20, w / h, 1, 20000 );
            // view2Cam.position.z = 3600;
            // view2Cam.position.x = 100;
            // view2Cam.position.y = 100;
            // views.push( new View( canvas2, fullWidth, fullHeight, view2Cam, renderer2, true ) );
            // view1CamHelper = new THREE.CameraHelper( view1Cam );
            // scene.add( view1CamHelper );

            // roll-over helpers
            var rollOverGeo = new THREE.BoxGeometry( 50, 50, 50 );
            rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
            rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
            scene.add( rollOverMesh );
            // cubes
            cubeGeo = new THREE.BoxGeometry( 50, 50, 50 );
            //cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xfeb74c, map: new THREE.TextureLoader().load( "textures/square-outline-textured.png" ) } );
            // grid
            var gridHelper = new THREE.GridHelper( 1000, 20 );
            scene.add( gridHelper );
            //
            raycaster = new THREE.Raycaster();
            mouse = new THREE.Vector2();
            var geometry = new THREE.PlaneBufferGeometry( 1000, 1000 );
            geometry.rotateX( - Math.PI / 2 );
            plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { visible: false } ) );
            scene.add( plane );
            objects.push( plane );
            // Lights
            var ambientLight = new THREE.AmbientLight( 0x606060 );
            scene.add( ambientLight );
            var directionalLight = new THREE.DirectionalLight( 0xffffff );
            directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
            scene.add( directionalLight );

            // window.addEventListener('resize', function() {
            // //view2Cam.aspect = window.innerWidth / window.innerHeight;
            // //camera.aspect = myCanvas.width / myCanvas.height;
            // //camera.updateProjectionMatrix();
            // renderer.setSize( window.innerWidth, window.innerHeight );
            // }, false);

            //animate();

            viewWithCamera.render()
            document.addEventListener( 'mousemove', onDocumentMouseMove, false );
				    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
				    document.addEventListener( 'keydown', onDocumentKeyDown, false );
				    document.addEventListener( 'keyup', onDocumentKeyUp, false );
          }

          // function animate(){
          //
          //   window.requestAnimationFrame( animate );
          // }

          function setCamera(deviceEvent){
            checkResize();
            var orientationInfo = OrientationCalculator.calculateOrientation(deviceEvent, null);
            viewWithCamera.setOrientationInfo(orientationInfo);
            viewWithCamera.render();
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

            if(viewWithCamera != null){
              viewWithCamera.setNewSize(width, height)
            }
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

          function onDocumentMouseMove( event ) {
            // event.preventDefault();
            // mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
            // raycaster.setFromCamera( mouse, view2Cam );
            // var intersects = raycaster.intersectObjects( objects );
            // if ( intersects.length > 0 ) {
            //   var intersect = intersects[ 0 ];
            //   rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
            //   rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
            // }
            // animate();
          }

          function onDocumentMouseDown( event ) {
            event.preventDefault();
            mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
            raycaster.setFromCamera( mouse, view2Cam );
            var intersects = raycaster.intersectObjects( objects );
            if ( intersects.length > 0 ) {
              var intersect = intersects[ 0 ];
              // delete cube
              if ( isShiftDown ) {
                if ( intersect.object != plane ) {
                  scene.remove( intersect.object );
                  objects.splice( objects.indexOf( intersect.object ), 1 );
                  //sendVoxel(voxel, false);
                }
              // create cube
              } else {
                var voxel = new THREE.Mesh( cubeGeo, cubeMaterial );
                voxel.position.copy( intersect.point ).add( intersect.face.normal );
                voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
                scene.add( voxel );
                objects.push( voxel );
                sendVoxel(voxel, true);
              }
              animate();
            }
          }
          function onDocumentKeyDown( event ) {
            switch( event.keyCode ) {
              case 16: isShiftDown = true; break;
            }
          }
          function onDocumentKeyUp( event ) {
            switch ( event.keyCode ) {
              case 16: isShiftDown = false; break;
            }
          }

          function sendVoxel(voxel, insert){
            var voxelDto = {
              x : voxel.position.x,
              y : voxel.position.y,
              z : voxel.position.z,
              insert : insert,
            }
            JhiTrackerService.sendSimpleMessageToJsonUser($rootScope.partnerIdForChat, {goal:'3d', content:'voxel' ,voxel: voxelDto});
          }
    }
})();
