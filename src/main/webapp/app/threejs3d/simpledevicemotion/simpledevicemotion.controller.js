(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('SimpleDeviceMotionController', SimpleDeviceMotionController);

    SimpleDeviceMotionController.$inject = ['OrientationCalculator'];

    function SimpleDeviceMotionController(OrientationCalculator) {
      var vm = this;
      vm.resetCamera = resetCamera;
      var container, camera, scene, renderer, geometry, mesh;
      var group1, group2, group3, light;
      var needsCalibration = true;

      function init(){
        container = document.getElementById( 'container' );
        /*
        camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 1, 1100);
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
        */
        camera = new THREE.PerspectiveCamera( 20, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.z = 1800;
        scene = new THREE.Scene();
        light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 0, 0, 1 );
        scene.add( light );


        var planeGeometry = new THREE.PlaneGeometry( 2000, 2000 );
        planeGeometry.rotateX( - Math.PI / 2 );
        var planeMaterial = new THREE.ShadowMaterial( { opacity: 0.2 } );

        var plane = new THREE.Mesh( planeGeometry, planeMaterial );
        plane.position.y = -200;
        plane.receiveShadow = true;
        scene.add( plane );

        var helper = new THREE.GridHelper( 2000, 100 );
        helper.position.y = - 199;
        helper.material.opacity = 0.25;
        helper.material.transparent = true;
        scene.add( helper );

        // shadow
        var canvas = document.createElement( 'canvas' );
        canvas.width = 128;
        canvas.height = 128;
        var context = canvas.getContext( '2d' );
        var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
        gradient.addColorStop( 0.1, 'rgba(210,210,210,1)' );
        gradient.addColorStop( 1, 'rgba(255,255,255,1)' );
        context.fillStyle = gradient;
        context.fillRect( 0, 0, canvas.width, canvas.height );
        var shadowTexture = new THREE.Texture( canvas );
        shadowTexture.needsUpdate = true;
        var shadowMaterial = new THREE.MeshBasicMaterial( { map: shadowTexture } );
        var shadowGeo = new THREE.PlaneBufferGeometry( 300, 300, 1, 1 );
        mesh = new THREE.Mesh( shadowGeo, shadowMaterial );
        mesh.position.y = - 250;
        mesh.rotation.x = - Math.PI / 2;
        scene.add( mesh );
        mesh = new THREE.Mesh( shadowGeo, shadowMaterial );
        mesh.position.y = - 250;
        mesh.position.x = - 400;
        mesh.rotation.x = - Math.PI / 2;
        scene.add( mesh );
        mesh = new THREE.Mesh( shadowGeo, shadowMaterial );
        mesh.position.y = - 250;
        mesh.position.x = 400;
        mesh.rotation.x = - Math.PI / 2;
        scene.add( mesh );
        var faceIndices = [ 'a', 'b', 'c' ];
        var color, f, f2, f3, p, vertexIndex,
        radius = 200,
        geometry  = new THREE.IcosahedronGeometry( radius, 1 ),
        geometry2 = new THREE.IcosahedronGeometry( radius, 1 ),
        geometry3 = new THREE.IcosahedronGeometry( radius, 1 );
        for ( var i = 0; i < geometry.faces.length; i ++ ) {
          f  = geometry.faces[ i ];
          f2 = geometry2.faces[ i ];
          f3 = geometry3.faces[ i ];
          for( var j = 0; j < 3; j++ ) {
            vertexIndex = f[ faceIndices[ j ] ];
            p = geometry.vertices[ vertexIndex ];
            color = new THREE.Color( 0xffffff );
            color.setHSL( ( p.y / radius + 1 ) / 2, 1.0, 0.5 );
            f.vertexColors[ j ] = color;
            color = new THREE.Color( 0xffffff );
            color.setHSL( 0.0, ( p.y / radius + 1 ) / 2, 0.5 );
            f2.vertexColors[ j ] = color;
            color = new THREE.Color( 0xffffff );
            color.setHSL( 0.125 * vertexIndex/geometry.vertices.length, 1.0, 0.5 );
            f3.vertexColors[ j ] = color;
          }
        }
        var materials = [
          new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors, shininess: 0 } ),
          new THREE.MeshBasicMaterial( { color: 0x000000, shading: THREE.FlatShading, wireframe: true, transparent: true } )
        ];
        group1 = THREE.SceneUtils.createMultiMaterialObject( geometry, materials );
        group1.position.x = -400;
        group1.rotation.x = -1.87;
        scene.add( group1 );
        group2 = THREE.SceneUtils.createMultiMaterialObject( geometry2, materials );
        group2.position.x = 400;
        group2.rotation.x = 0;
        scene.add( group2 );
        group3 = THREE.SceneUtils.createMultiMaterialObject( geometry3, materials );
        group3.position.x = 0;
        group3.rotation.x = 0;
        scene.add( group3 );
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setClearColor( 0xffffff );
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
        if(needsCalibration){
        //  OrientationCalculator.setBaseLine(event);
          needsCalibration = false;
        }else{
          var motionInfo = OrientationCalculator.calculateDistance(event, 1000);
          //console.log("X: "+motionInfo.x +" Y: "+motionInfo.y+" Z: "+motionInfo.z);
          camera.position.x += motionInfo.right;
          //camera.position.y += motionInfo.up;
          camera.position.z += motionInfo.forward;
          //console.log("cam pos: "+camera.position.z+" change: "+motionInfo.z);
          //
          //console.log("new cam pos: "+camera.position.z);
          //console.log("X: "+camera.position.x +" Y: "+camera.position.y+" Z: "+camera.position.z);

          animate();
        }
      }

      function resetCamera(){
        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = 1800;
        needsCalibration = true;
        animate();
      }

      init();
    }
})();
