(function() {
    'use strict';
    /* globals SockJS, Stomp */

    angular
        .module('simpleWebrtcServerApp')
        .factory('AnnotationToolService', AnnotationToolService);

    AnnotationToolService.$inject = [];

    function AnnotationToolService() {
        var textureLoader = new THREE.TextureLoader();
        var tools;

        var service = {
            getAnnotationTools: getAnnotationTools,
            initAnnotationTools: initAnnotationTools
        };
        return service;

        function initAnnotationTools(requestedTools) {
            tools = [];
            angular.forEach(requestedTools, function(value, key) {
                var manager = null;
                if (value.type == 'Box') {
                    manager = new BoxManager();
                } else if (value.type == 'Arrow') {
                    manager = new ArrowManager();
                } else if (value.type == 'Sprite') {
                    manager = new SpriteManager(value.spriteLocation);
                }
                if (manager) {
                    var tool = new Tool(value.name, manager, value.type, value.spriteLocation);
                    tools.push(tool);
                }
            });
        }

        function getAnnotationTools() {
            return tools;
        }

        function Tool(name, action, type, spriteLocation) {
            this.name = name;
            this.actionManager = action;
            this.type = type;
            this.location = spriteLocation;
        }

        function BoxManager() {
            var cubeGeo = new THREE.BoxGeometry(50, 50, 50);
            var cubeMaterial;

            this.action = function(intersect, scene, activeGroup) {
                var voxel = simpleInsert(intersect.point, scene, activeGroup);
                var message = writeMessage(activeGroup, true, "Box", voxel.position);
                activeGroup.messages.push(message);
            }

            this.handleInsert = function(voxelDtos, scene, activeGroup) {
                if (activeGroup) {
                    var startVoxel = voxelDtos[0];
                    var position = new THREE.Vector3(startVoxel.x, startVoxel.y, startVoxel.z);
                    simpleInsert(position, scene, activeGroup);
                }
            }

            function simpleInsert(position, scene, activeGroup) {
                var voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
                voxel.position.copy(position); //.add( intersect.face.normal );
                voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                scene.add(voxel);
                activeGroup.objects.push(voxel);
                return voxel;
            }
        }

        function SpriteManager(location) {
            var spriteLocation = location;
            var spriteMap = textureLoader.load(spriteLocation);
            var spriteMaterial = new THREE.SpriteMaterial({
                map: spriteMap,
                transparent: true
            });

            this.action = function(intersect, scene, activeGroup) {
                var sprite = simpleInsert(intersect.point, scene, activeGroup);
                var message = writeMessage(activeGroup, true, "Sprite", sprite.position, null, spriteLocation);
                activeGroup.messages.push(message);
            }

            this.handleInsert = function(voxelDtos, scene, activeGroup) {
                if (activeGroup) {
                    var startVoxel = voxelDtos[0];
                    var position = new THREE.Vector3(startVoxel.x, startVoxel.y, startVoxel.z);
                    simpleInsert(position, scene, activeGroup);
                }
            }

            function simpleInsert(position, scene, activeGroup) {
                var sprite = new THREE.Sprite(spriteMaterial);
                sprite.position.copy(position); //.add( intersect.face.normal );
                sprite.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                scene.add(sprite);
                activeGroup.sprites.push(sprite);
                return sprite;
            }
        }

        function ArrowManager() {
            var startPos = 0;

            this.action = function(intersect, scene, activeGroup) {
                if (startPos == 0) {
                    startPos = intersect.point;
                } else {
                    var endPos = intersect.point;
                    simpleInsert(startPos, endPos, scene, activeGroup);
                    var message = writeMessage(activeGroup, true, "Arrow", startPos, endPos);
                    activeGroup.messages.push(message);
                    startPos = 0;
                }
            }

            this.handleInsert = function(voxelDtos, scene, activeGroup) {
                if (activeGroup) {
                    var startVoxel = voxelDtos[0];
                    var endVoxel = voxelDtos[1];
                    var startPos = new THREE.Vector3(startVoxel.x, startVoxel.y, startVoxel.z);
                    var endPos = new THREE.Vector3(endVoxel.x, endVoxel.y, endVoxel.z);
                    simpleInsert(startPos, endPos, scene, activeGroup);
                }
            }

            function simpleInsert(startPos, endPos, scene, activeGroup) {
                var dir = new THREE.Vector3(startPos.x - endPos.x, startPos.y - endPos.y, startPos.z - endPos.z).normalize();
                var origin = new THREE.Vector3(endPos.x, endPos.y, endPos.z);
                var length = Math.sqrt(Math.pow(endPos.x - startPos.x, 2) + Math.pow(endPos.y - startPos.y, 2) + Math.pow(endPos.z - startPos.z, 2));
                //var hex = 0xffff00; // Gelb
                var hex = 0x0bf23d; // Grün
                var arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
                arrowHelper.line.material.linewidth = 2;
                scene.add(arrowHelper);
                activeGroup.objects.push(arrowHelper);
                return arrowHelper;
            }
        }

        function writeMessage(group, insert, content, position, endPosition, spriteLocation) {
            var startPointDto = getVoxelDto(position, insert);
            var endPointDto;
            if (endPosition) {
                endPointDto = getVoxelDto(endPosition, insert);
            }
            return {
                goal: '3d',
                content: content,
                voxel: startPointDto,
                endPoint: endPointDto,
                type: spriteLocation,
                group: {
                    id: group.id,
                    visibleForUser: group.visibleForUser
                }
            };
        }

        function getVoxelDto(position, insert) {
            return {
                x: position.x,
                y: position.y,
                z: position.z,
                insert: insert
            }
        }

    }
})();