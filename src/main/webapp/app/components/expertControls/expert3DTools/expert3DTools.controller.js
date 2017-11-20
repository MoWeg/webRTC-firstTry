(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('Expert3DToolsController', Expert3DToolsController);

    Expert3DToolsController.$inject = ['$scope', '$rootScope', 'AnnotationToolService'];

    function Expert3DToolsController($scope, $rootScope, AnnotationToolService) {
      var vm = this;
      //from outside
      var toolRequest = [];
      var activeGroup = $scope.activegroup;
      var scene = $scope.scene;
      var raycaster = $scope.raycaster;
      var rollOverMesh = $scope.rollovermesh;
      var gridHelper = $scope.gridhelper;
      var view2Cam = $scope.expertcamera;
      var mouse;
      var newPosY;

      var movableGrid = {name: 'grid' , leftOrRight:moveGridLeftOrRight, upOrDown:moveGridUpOrDown}
      var movableCam = {name: 'camera', leftOrRight:moveCamLeftOrRight, upOrDown:moveCamUpOrDown}
      var tabPressed = false;

      vm.tools = [];
      vm.activeTool = null;
      vm.movables = [];
      vm.activeMovable =  movableGrid;
      vm.setActiveTool = function(tool){
        vm.activeTool = tool;
      };
      vm.setActiveMovable = function(movable){
        vm.activeMovable = movable;
      }

      function init(){
        mouse = new THREE.Vector2();
        newPosY = 0;

        toolRequest.push({name:'insert box', type:'box', spriteLocation: null})
        toolRequest.push({name:'insert arrow', type:'arrow', spriteLocation: null})
        toolRequest.push({name:'insert jHipster', type:'sprite', spriteLocation: 'content/images/logo-jhipster.png'})

        vm.tools = AnnotationToolService.getAnnotationTools(toolRequest);

        vm.movables.push(movableGrid);
        vm.movables.push(movableCam);

        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        document.addEventListener( 'mousedown', onDocumentMouseDown, false );
        // document.addEventListener('mouseup', onDocumentMouseUp, false);
        document.addEventListener( 'keydown', onDocumentKeyDown, false );
        document.addEventListener( 'keyup', onDocumentKeyUp, false );
      }

      function onDocumentMouseMove( event ) {
        event.preventDefault();
        mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
        raycaster.setFromCamera( mouse, view2Cam );
        var intersects = raycaster.intersectObjects( activeGroup.objects );
        if ( intersects.length > 0 ) {
          var intersect = intersects[ 0 ];
          intersect.point.y = intersect.point.y + newPosY;
          rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
          rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
        }
        animate();
      }

      function onDocumentMouseDown( event ) {
        event.preventDefault();
        mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
        raycaster.setFromCamera( mouse, view2Cam );
        var intersects = raycaster.intersectObjects( activeGroup.objects );
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
            if(vm.activeTool){
              intersect.point.y = intersect.point.y + newPosY;
              console.log(scene.children.length);
              console.log(activeTool.objects);
              vm.activeTool.actionManager.action(intersect, scene, activeGroup.objects, activeGroup.sprites);
              console.log(scene.children.length);
              console.log(activeTool.objects);
            }
          }
          animate();
        }
      }

      function onDocumentKeyDown( event ) {
        switch( event.keyCode ) {
          case  9: event.preventDefault(); tabPressed = !tabPressed; break;
          case 16: isShiftDown = true; break;
          case 27: event.preventDefault();  resetCamera(); break;
          case 65:
          case 37: event.preventDefault(); vm.activeMovable.leftOrRight(false); break;
          case 87:
          case 38: event.preventDefault(); vm.activeMovable.upOrDown(true); break;
          case 68:
          case 39: event.preventDefault(); vm.activeMovable.leftOrRight(true); break;
          case 83:
          case 40: event.preventDefault(); vm.activeMovable.upOrDown(false); break;
        }
      }
      function onDocumentKeyUp( event ) {
        switch ( event.keyCode ) {
          case 16: isShiftDown = false; break;
        }
      }

      function moveGridUpOrDown(positive){
        var direction = 50;
        if(!positive){
          direction = -50;
        }
        if(tabPressed){
          var oldPos = gridHelper.position.z;
          gridHelper.position.z = oldPos + direction;
        }else{
          var oldPos = gridHelper.position.y;
          newPosY = oldPos + direction;
          gridHelper.position.y = newPosY;
        }
        animate();
      }

      function moveGridLeftOrRight(positive){
        var direction = 50;
        if(!positive){
          direction = -50;
        }
        var oldPos = gridHelper.position.x;
        gridHelper.position.x = oldPos + direction;
        animate();
      }

      function moveCamLeftOrRight(positive){
        var direction = 200;
        if(!positive){
          direction = -200;
        }
        var oldPos = view2Cam.position.x;
        view2Cam.position.x = oldPos + direction;
        view2Cam.lookAt(scene);
        animate();
      }

      function moveCamUpOrDown(positive){
        var direction = -200;
        if(!positive){
          direction = 200;
        }
        if(tabPressed){
          var oldPos = view2Cam.position.y;
          view2Cam.position.y = oldPos + direction;
        }else{
          var oldPos = view2Cam.position.z;
          view2Cam.position.z = oldPos + direction;
        }
        view2Cam.lookAt(scene);
        animate();
      }

      function resetCamera(){
        view2Cam.position.set( 900, 900, 1600 );
        animate();
      }

      function animate() {
        $rootScope.$broadcast('request-animation');
      }
      init();
    }
})();
