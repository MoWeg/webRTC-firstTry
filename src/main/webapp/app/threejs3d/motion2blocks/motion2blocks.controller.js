(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('Motion2BlocksController', Motion2BlocksController);

    Motion2BlocksController.$inject = ['OrientationCalculator'];

    function Motion2BlocksController(OrientationCalculator) {
      var vm = this;
      vm.resetCubes = resetCubes;
      vm.switchMethod = switchMethod;
      var container;
  		var camera, scene, renderer;
  		var plane, cube;
  		var mouse, raycaster, isShiftDown = false;
  		var rollOverMesh, rollOverMaterial;
  		var cubeGeo, cubeMaterial;
  		var objects = [];
      var lastPosX = 0;
      var lastPosY = 0;
      var lastPosZ = 0;

      var isWithOrientation = false;

      function init(){
        //container = document.createElement( 'div' );
  			//document.body.appendChild( container );
  			//var info = document.createElement( 'div' );
  			//info.style.position = 'absolute';
        //info.style.top = '10px';
  		  //info.style.width = '100%';
  		  //info.style.textAlign = 'center';
  			//info.innerHTML = '<a href="http://threejs.org" target="_blank" rel="noopener">three.js</a> - voxel painter - webgl<br><strong>click</strong>: add voxel, <strong>shift + click</strong>: remove voxel';
  			//container.appendChild( info );
          container = document.getElementById( 'container' );
				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
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
  				renderer = new THREE.WebGLRenderer( { antialias: true } );
  				renderer.setClearColor( 0xf0f0f0 );
        //  renderer.setClearColor( 'transparent' );
  				renderer.setPixelRatio( window.devicePixelRatio );
  				renderer.setSize( window.innerWidth, window.innerHeight );
  				container.appendChild( renderer.domElement );


        window.addEventListener('resize', function() {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize( window.innerWidth, window.innerHeight );
        }, false);

        animate();
        console.log("X: "+camera.position.x +" Y: "+camera.position.y+" Z: "+camera.position.z);
        window.requestAnimationFrame( animate );
      //  window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
      //  window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );
        window.addEventListener( 'devicemotion', deviceMotionHandler, false);
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

      function deviceMotionHandler(event){
        if(isWithOrientation){
          var motionInfo = OrientationCalculator.calculateDistanceWithOrientation(event, 1000);
        } else {
          var motionInfo = OrientationCalculator.calculateDistance(event, 1000);
        }

        if(motionInfo.right != 0 || motionInfo.up != 0 || motionInfo.forward != 0){
          lastPosX += motionInfo.right;
          lastPosY += motionInfo.up;
          lastPosZ += motionInfo.forward;

          var voxel = new THREE.Mesh( cubeGeo, cubeMaterial );
              //voxel.position.copy( intersect.point ).add( intersect.face.normal );
              //voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
          voxel.position.x = lastPosX;
          voxel.position.y = lastPosY;
          voxel.position.z = lastPosZ;
          scene.add( voxel );
          objects.push( voxel );

          animate();
        }
      }

      function resetCubes(){
        lastPosX  = 0;
        lastPosY  = 0;
        lastPosZ  = 0;
        angular.forEach(objects, function(value, key){
          if(value != plane){
            scene.remove(value);
            objects.splice(key, 1);
          }
        });
        animate();
      }

      function switchMethod(){
        if (isWithOrientation) {
          isWithOrientation = false;
        } else {
          isWithOrientation = true;
        }
        console.log("isWithOrientation: "+isWithOrientation);
      }

      init();
    }
})();
