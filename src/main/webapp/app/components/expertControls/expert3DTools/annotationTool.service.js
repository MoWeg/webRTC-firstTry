(function() {
    'use strict';
    /* globals SockJS, Stomp */

    angular
        .module('simpleWebrtcServerApp')
        .factory('AnnotationToolService', AnnotationToolService);

    AnnotationToolService.$inject = ['JhiTrackerService','$rootScope'];

    function AnnotationToolService (JhiTrackerService,$rootScope ) {
      var textureLoader =  new THREE.TextureLoader();
      var service = {
        getAnnotationTools: getAnnotationTools
      };
      return service;

      function getAnnotationTools(requestedTools){
        var tools = [];
        angular.forEach(requestedTools, function(value, key) {
          var manager = null;
          if(value.type == 'box'){
            manager = new BoxManager();
          }else if(value.type == 'arrow'){
            manager = new ArrowManager();
          }else if(value.type == 'sprite'){
            manager = new SpriteManager(value.spriteLocation);
          }
          if(manager){
            var tool = new Tool(value.name, manager);
            tools.push(tool);
          }
        });
        return tools;
      }

      function Tool(name, action){
        this.name = name;
        this.actionManager = action;
      }

      function BoxManager(){
        var cubeGeo = new THREE.BoxGeometry( 50, 50, 50 );
        var cubeMaterial;

        this.action = function(intersect, scene, activeGroup) {
          var voxel = new THREE.Mesh( cubeGeo, cubeMaterial );
          voxel.position.copy( intersect.point ).add( intersect.face.normal );
          voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
          scene.add( voxel );
          activeGroup.objects.push( voxel );
          var message = writeMessage(activeGroup.id, true, "voxel", voxel.position);
          activeGroup.messages.push( message );
        }
      }

      function SpriteManager(spriteLocation){
        var spriteMap = textureLoader.load( spriteLocation );
        var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, transparent:true} );

        this.action = function(intersect, scene, activeGroup) {
          var sprite = new THREE.Sprite( spriteMaterial );
          sprite.position.copy( intersect.point ).add( intersect.face.normal );
          sprite.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
          scene.add( sprite );
          activeGroup.sprites.push( sprite );
          var message = writeMessage(activeGroup.id, true, spriteLocation, sprite.position);
          activeGroup.messages.push( message );
        }
      }

      function ArrowManager(){
        var startPos = 0;

        this.action = function(intersect, scene, activeGroup){
          if(startPos == 0){
            startPos = intersect.point;
          } else {
            var endPos = intersect.point;
            var dir = new THREE.Vector3(startPos.x-endPos.x, startPos.y-endPos.y, startPos.z-endPos.z).normalize();
            var origin = new THREE.Vector3(endPos.x, endPos.y, endPos.z);
            var length = Math.sqrt(Math.pow(endPos.x-startPos.x, 2) +  Math.pow(endPos.y-startPos.y, 2) +  Math.pow(endPos.z-startPos.z, 2));
            //var hex = 0xffff00; // Gelb
            var hex = 0x0bf23d; // Grün
            var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
            arrowHelper.line.material.linewidth = 2;
            scene.add( arrowHelper );
            activeGroup.objects.push( arrowHelper );
            var message = writeMessage(activeGroup.id, true, "arrow", startPos, endPos);
            activeGroup.messages.push( message );
            startPos = 0;
          }
        }
      }

      function writeMessage(id, insert, content, position, endPosition){
        var startPointDto = getVoxelDto(position, insert);
        var endPointDto;
        if(endPosition){
          endPointDto = getVoxelDto(endPosition, insert);
        }
        return {goal: '3d', content: content, voxel: startPointDto, endPoint:endPointDto, groupId: id};
      }

      function getVoxelDto(position, insert){
        return {
          x : position.x,
          y : position.y,
          z : position.z,
          insert: insert
        }
      }

    }
})();
