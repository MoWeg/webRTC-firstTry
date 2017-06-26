(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('Proto3D1on1Controller', Proto3D1on1Controller);

    Proto3D1on1Controller.$inject = ['$rootScope','$cookies', '$http','JhiTrackerService', 'SdpService', 'OrientationCalculator'];

    function Proto3D1on1Controller($rootScope, $cookies, $http, JhiTrackerService, SdpService, OrientationCalculator) {
      //navigator.getUserMedia = navigator.getUserMedia ||
      //navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia ||
      navigator.mediaDevices.webkitGetUserMedia || navigator.mediaDevices.mozGetUserMedia;

      var vm = this;
      //var isChannelReady;
      var isInitiator = $rootScope.isInitiator;
      var isStarted = false;
      var gotAnswer = false;
      var localStream;
      var pc;
      var remoteStream;
      var turnReady;

      //var pc_config = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'},{'url': 'stun:stun4.l.google.com:19302'},{'url': 'stun:stun1.l.google.com:19302'},{'url': 'stun:stun01.sipphone.com'},{'url': 'stun1.voiceeclipse.net'}]};
      var pc_config = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}; //, stun:stun4.l.google.com:19302, stun:stun1.l.google.com:19302, stun:stun01.sipphone.com
      var pc_constraints = {'optional': [{'DtlsSrtpKeyAgreement': true}]};

      // Set up audio and video regardless of what devices are present.
      var sdpConstraints = {'mandatory': {
        'OfferToReceiveAudio':true,
        'OfferToReceiveVideo':true }};


      var localVideo = document.querySelector('#video');

    //Signaling
    /////////////////////////////////////////////

    function sendMessage(message){
      console.log('Client send message:', message);
        JhiTrackerService.sendSimpleMessageToJsonUser($rootScope.partnerIdForChat, message);
    }

    JhiTrackerService.receiveInvite().then(null, null, function(received) {
        handleContent(received);
    });

    function handleContent (message){
       console.log('Client received message:', message);
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
        } else if (message.goal == 'canvas'){
          if(message.content == 'reset'){
              clearCanvas();
          }
          if(message.content == 'paint'){
            receivePaintingInfo(message);
          }
        }
    }

////////////////////////////////////////////////////
    function handleUserMedia(stream) {
      console.log('Adding local stream.');
      localVideo.src = window.URL.createObjectURL(stream);
      localStream = stream;
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

    var constraints = {video: true};
    //navigator.getUserMedia(constraints, handleUserMedia, handleUserMediaError);
    //var constraints = {video: {facingMode: { exact: "environment" }}};
    navigator.mediaDevices.getUserMedia(constraints).then(handleUserMedia).catch(handleUserMediaError);

    console.log('Getting user media with constraints', constraints);

    if (location.hostname != "localhost") {
      console.log('would request turn');
      //requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
    }

    window.onbeforeunload = function(e){
	     sendMessage({'content':'bye'});
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
      alert('Cannot create RTCPeerConnection object.');
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

    function handleCreateAnswerError(event){
      console.log('createAnswer() error: ', e);
    }

    function doCall() {
      console.log('Sending offer to peer.');
      pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
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
  stop();
  sendMessage('bye');
}

function handleRemoteHangup() {
//  console.log('Session terminated.');
  // stop();
  // isInitiator = false;
}

function stop() {
  isStarted = false;
  // isAudioMuted = false;
  // isVideoMuted = false;
    pc.close();
    pc = null;
  }

///////////////////////////////////////////

  function preferOpus(sdp){
    return SdpService.getOpus(sdp);
  }
//////////////////////////////////////////////////////////////////////////////////
// 3D

    //vm.resetCubes = resetCubes;
    var container;
    var camera, scene, renderer;
    var plane, cube;
    var mouse, raycaster, isShiftDown = false;
    var rollOverMesh, rollOverMaterial;
    var cubeGeo, cubeMaterial;
    var objects = [];
    init3D();
    function init3D(){
      //container = document.createElement( 'div' );
      //document.body.appendChild( container );
      //var info = document.createElement( 'div' );
      //info.style.position = 'absolute';
      //info.style.top = '10px';
      //info.style.width = '100%';
      //info.style.textAlign = 'center';
      //info.innerHTML = '<a href="http://threejs.org" target="_blank" rel="noopener">three.js</a> - voxel painter - webgl<br><strong>click</strong>: add voxel, <strong>shift + click</strong>: remove voxel';
      //container.appendChild( info );
        var myCanvas = {};
        myCanvas.node = document.getElementById('drawingCanvas');

        //container = document.getElementById( 'innerContainer' );
        container = document.getElementById( 'innerContainer' );
        camera = new THREE.PerspectiveCamera( 45, myCanvas.width /myCanvas.height, 1, 10000 );
        //camera = new THREE.PerspectiveCamera( 45, localVideo.width / localVideo.height, 1, 10000 );
        camera.position.set( 500, 800, 1300 );
        camera.lookAt( new THREE.Vector3() );
        scene = new THREE.Scene();
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
        renderer = new THREE.WebGLRenderer( { antialias: true} );
      //  renderer.setClearColor( 'transparent' );

        rrenderer.setClearColor( 0xf0f0f0 );
        renderer.setPixelRatio( window.devicePixelRatio );
        //renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.setSize( myCanvas.width, myCanvas.height );
        //renderer.domElement = myCanvas;
        //
        renderer.domElement.style.position = 'absolute';
        container.appendChild( renderer.domElement );


        window.addEventListener('resize', function() {
        //camera.aspect = window.innerWidth / window.innerHeight;
        camera.aspect = myCanvas.width / myCanvas.height;
        camera.updateProjectionMatrix();
        //renderer.setSize( window.innerWidth, window.innerHeight );
        }, false);

        animate();
        console.log("X: "+camera.position.x +" Y: "+camera.position.y+" Z: "+camera.position.z);
        window.requestAnimationFrame( animate );
//  window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
//  window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );
    //    window.addEventListener( 'devicemotion', deviceMotionHandler, false);
        window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
        window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );
      }

      function animate(){
        //camera.lookAt( scene.position );
        renderer.render(scene, camera);
      }

      function onScreenOrientationChangeEvent(orientation){
        var orientationInfo = OrientationCalculator.calculateOrientation(null, orientation);
        setOrientationInfo(orientationInfo);
        animate();
      }

      function onDeviceOrientationChangeEvent(deviceEvent){
        var orientationInfo = OrientationCalculator.calculateOrientation(deviceEvent, null);
        setOrientationInfo(orientationInfo);
        animate();
      }

      function setOrientationInfo(orientationInfo){
        camera.quaternion.setFromEuler(orientationInfo.eulerOrientation);
        camera.quaternion.multiply(orientationInfo.backCamMultiplier);
        camera.quaternion.multiply(orientationInfo.screenAdjustment);
      }
    }
})();