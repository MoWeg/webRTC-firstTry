(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('Orientation2MotionController', Orientation2MotionController);

    Orientation2MotionController.$inject = ['OrientationCalculator'];

    function Orientation2MotionController(OrientationCalculator) {
      var vm = this;
      var container, camera, scene, renderer, geometry, mesh;

      function init(){
        container = document.getElementById( 'container' );
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
        //controls = new DeviceOrientationControls( camera );
        //controls = DeviceMotionCameraOrientation.get(camera);
        //init(camera);
        scene = new THREE.Scene();
        var geometry = new THREE.SphereGeometry( 500, 16, 8 );
        geometry.scale( - 1, 1, 1 );
        //var material = new THREE.MeshBasicMaterial( {
          //map: new THREE.TextureLoader().load( 'textures/2294472375_24a3b8ef46_o.jpg' )
        //} );
        var mesh = new THREE.Mesh( geometry, material );
        scene.add( mesh );
        var geometry = new THREE.BoxGeometry( 100, 100, 100, 4, 4, 4 );
        var material = new THREE.MeshBasicMaterial( { color: 0xff00ff, side: THREE.BackSide, wireframe: true } );
        var mesh = new THREE.Mesh( geometry, material );
        scene.add( mesh );
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = 0;
        container.appendChild(renderer.domElement);
        window.addEventListener('resize', function() {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize( window.innerWidth, window.innerHeight );
        }, false);
        animate();
        console.log("X: "+camera.position.x +" Y: "+camera.position.y+" Z: "+camera.position.z);
        window.requestAnimationFrame( animate );
        window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
        window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );
        window.addEventListener('devicemotion', deviceMotionHandler, false);
      }

      function animate(){
        console.log("X: "+camera.position.x +" Y: "+camera.position.y+" Z: "+camera.position.z);
        renderer.render(scene, camera);
      }

      function onScreenOrientationChangeEvent(orientation){
        var orientationInfo = OrientationCalculator.calculate(null, orientation);
        setOrientationInfo(orientationInfo);
        animate();
      }

      function onDeviceOrientationChangeEvent(deviceEvent){
        var orientationInfo = OrientationCalculator.calculate(deviceEvent, null);
        setOrientationInfo(orientationInfo);
        animate();
      }

      function setOrientationInfo(orientationInfo){
        camera.quaternion.setFromEuler(orientationInfo.eulerOrientation);
        camera.quaternion.multiply(orientationInfo.backCamMultiplier);
        camera.quaternion.multiply(orientationInfo.screenAdjustment);
      }

      function deviceMotionHandler(event){
        var factor = 10;
        var workingX = event.acceleration.x;
        var workingY = event.acceleration.y;
        var workingZ = event.acceleration.z;

        var intervalInSeconds = event.interval*0.001;
        var sqIntervalInSecs = intervalInSeconds*intervalInSeconds;
        var metersRight =  0.5*workingX*sqIntervalInSecs;
        var metersUp = 0.5*workingY*sqIntervalInSecs;
        var metersForward = -0.5*workingZ*sqIntervalInSecs;

        camera.position.z += 10*metersForward;

        //if(isBiggerThenThreshold(workingX)||isBiggerThenThreshold(workingY)||isBiggerThenThreshold(workingZ)){
          //  console.log("X: "+ workingX +" Y: "+workingY+" Z: "+workingZ);
          //var deviceX = workingX;
          //var deviceY = workingY;
          //var deviceZ = workingZ;


          //camera.position.x += deviceX;
          //camera.position.y += deviceY;
          //camera.position.z += -deviceZ;
          //camera.position.z += -0.5*deviceZ*intervalInSeconds*intervalInSeconds;

        //  var target = new THREE.Vector3( 0, 0, 0 );
        //  target.x = camera.position.x + 0.5*deviceX*intervalInSeconds*intervalInSeconds;
        //  target.y = camera.position.y + 0.5*deviceY*intervalInSeconds*intervalInSeconds;
        //  target.z = camera.position.z - 0.5*deviceZ*intervalInSeconds*intervalInSeconds;
        //  camera.lookAt(target);
          //console.log("X: "+camera.position.x +" Y: "+camera.position.y+" Z: "+camera.position.z);

        //}
        animate();
      }

      function isBiggerThenThreshold(value){
        var threshold = 1;
        return value >= threshold || value <= - threshold;
      }
      init();
    }
})();
