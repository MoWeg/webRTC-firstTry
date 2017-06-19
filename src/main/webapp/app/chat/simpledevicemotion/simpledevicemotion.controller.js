(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('SimpleDeviceMotionController', SimpleDeviceMotionController);

    SimpleDeviceMotionController.$inject = ['OrientationCalculator'];

    function SimpleDeviceMotionController(OrientationCalculator) {
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
        window.requestAnimationFrame( animate );
        window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
        window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );
      }

      function animate(){
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
      init();
    }
})();
