(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('MultipleCanvasController', MultipleCanvasController);

    MultipleCanvasController.$inject = ['Detector'];

    function MultipleCanvasController(Detector) {
      if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
			var container;
			var camera, scene, renderer, controls;
			var mesh, group1, group2, group3, light;
			var mouseX = 0, mouseY = 0;
			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;
      var views = [];
      var view1CamHelper;

      init();
      animate();

      function View( canvas, fullWidth, fullHeight, viewX, viewY, viewWidth, viewHeight, inputCamera, withHelper) {
        var showHelper = withHelper;
        console.log(showHelper);

        canvas.width = viewWidth * window.devicePixelRatio;
				canvas.height = viewHeight * window.devicePixelRatio;
				var context = canvas.getContext( '2d' );

        if(inputCamera){
          var camera = inputCamera;
        }else{
          var camera = new THREE.PerspectiveCamera( 20, viewWidth / viewHeight, 1, 10000 );
  				camera.setViewOffset( fullWidth, fullHeight, viewX, viewY, viewWidth, viewHeight );
  				camera.position.z = 1800;
        }

				this.render = function () {

          view1CamHelper.visible = showHelper;
          if(showHelper == false){
            camera.position.x += ( mouseX - camera.position.x ) * 0.05;
  					camera.position.y += ( - mouseY - camera.position.y ) * 0.05;
          }

					camera.lookAt( scene.position );
					renderer.render( scene, camera );
					context.drawImage( renderer.domElement, 0, 0 );
				};
			}

      function init() {
        // container = document.getElementById( 'container' );
        // camera = new THREE.PerspectiveCamera( 20, window.innerWidth / window.innerHeight, 1, 10000 );
        // camera.position.z = 1800;
        var canvas1 = document.getElementById( 'canvas1' );
				var canvas2 = document.getElementById( 'canvas2' );

				var w = 300, h = 200;
				var fullWidth = w * 2;
				var fullHeight = h * 2;

        var view1Cam = new THREE.PerspectiveCamera( 20, w / h, 1, 10000 );
        view1Cam.position.z = 1800;
        views.push( new View( canvas1, fullWidth, fullHeight, w * 0, h * 0, w, h, view1Cam, false ) );

        var view2Cam = new THREE.PerspectiveCamera( 20, w / h, 1, 20000 );
        view2Cam.position.z = 3600;
        view2Cam.position.x = 100;
				views.push( new View( canvas2, fullWidth, fullHeight, w * 1, h * 0, w, h, view2Cam, true ) );

        scene = new THREE.Scene();

        view1CamHelper = new THREE.CameraHelper( view1Cam );
        scene.add( view1CamHelper );

        light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 0, 0, 1 );
        scene.add( light );
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
				renderer.setSize( 300, 200 );
        document.addEventListener( 'mousemove', onDocumentMouseMove, false );

      }

      function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
      }
      function onDocumentMouseMove( event ) {
        mouseX = ( event.clientX - windowHalfX );
        mouseY = ( event.clientY - windowHalfY );
      }
      //
      function animate() {
        angular.forEach(views, function(view){
          view.render()
        });
        requestAnimationFrame( animate );
      }
    }
})();
