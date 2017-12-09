(function() {
    'use strict';
    /* globals SockJS, Stomp */

    angular
        .module('simpleWebrtcServerApp')
        .factory('ThreejsSceneService', ThreejsSceneService);

    ThreejsSceneService.$inject = ['$q'];

    function ThreejsSceneService($q) {
        var scene, plane, raycaster;
        var camera;
        var helperDeferred = $q.defer();

        var service = {
            resetScene: resetScene,
            getScene: getScene,
            getPlane: getPlane,
            getRayCaster: getRayCaster,
            getCamera: getCamera,
            getView: getView,
            getHelperPromise: getHelperPromise,
            removeGroupFromScene: removeGroupFromScene,
        };
        return service;

        function resetScene() {
            scene = null;
            plane = null;
            raycaster = null;
        }

        function getHelperPromise() {
            return helperDeferred.promise;
        }

        function removeGroupFromScene(group) {
            if (group) {
                if (group.objects) {
                    angular.forEach(group.objects, function(object) {
                        scene.remove(object);
                    })
                }
                if (group.sprites) {
                    angular.forEach(group.sprites, function(sprite) {
                        scene.remove(sprite);
                    })
                }
            }
        }

        function getCamera() {
            if (!camera) {
                var canvasWidth = 480;
                var canvasHeight = 640;
                var minRenderDistance = 1;
                var maxRenderDistance = 10000;
                var fovDegrees = 45;
                camera = new THREE.PerspectiveCamera(fovDegrees, canvasHeight / canvasWidth, minRenderDistance, maxRenderDistance);
                var x = 0;
                var y = 800;
                var z = 1300;
                camera.position.set(x, y, z);
                //getCamera(w, h, 1, 10000, 0, 800, 1300);
            }
            return camera;
        }

        function getScene() {
            if (!scene) {
                scene = new THREE.Scene();

                raycaster = new THREE.Raycaster();
                var geometry = new THREE.PlaneBufferGeometry(2000, 2000);
                geometry.rotateX(-Math.PI / 2);
                plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
                    visible: false
                }));
                scene.add(plane);

                var ambientLight = new THREE.AmbientLight(0x606060);
                scene.add(ambientLight);
                var directionalLight = new THREE.DirectionalLight(0xffffff);
                directionalLight.position.set(1, 0.75, 0.5).normalize();
                scene.add(directionalLight);
            }
            return scene;
        }

        function getPlane() {
            if (!scene) {
                getScene();
            }
            return plane;
        }

        function getRayCaster() {
            if (!scene) {
                getScene();
            }
            return raycaster;
        }


        function getView(canvas, viewWidth, viewHeight, inputCamera, alpha, clearColor, intesity) {
            var renderer = getRenderer(alpha, clearColor, intesity, viewWidth, viewHeight);
            var view = new View(viewWidth, viewHeight, inputCamera, renderer);
            canvas.appendChild(view.renderer.domElement);
            return view;
        }

        function getRenderer(alpha, clearColor, intesity, width, height) {
            var renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: alpha
            });
            renderer.setClearColor(clearColor, intesity);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(width, height);
            return renderer;
        }

        function View(viewWidth, viewHeight, inputCamera, renderer) {
            var scene = getScene();
            this.renderer = renderer;
            var camera = inputCamera;
            var helpers;
            var seesHelper = false;

            getHelperPromise().then(function(args) {
                helpers = args;
            });

            this.isExpert = function(expertStatus) {
                if (expertStatus) {
                    addHelpers(scene);
                    seesHelper = true;
                }
            }

            this.render = function(groups) {
                if (helpers) {
                    setHelperVisiblity(seesHelper);
                }
                if (groups) {
                    angular.forEach(groups, function(group) {
                        var visisbility = group.visibleForUser;
                        if (seesHelper) {
                            visisbility = group.visible;
                        }

                        if (visisbility) {
                            angular.forEach(group.sprites, function(value, key) {
                                var material = value.material;
                                // var scale = Math.sin( time + sprite.position.x * 0.01 ) * 0.3 + 1.0;
                                var scale = 1;
                                var imageWidth = 1;
                                var imageHeight = 1;
                                if (material.map && material.map.image && material.map.image.width) {
                                    imageWidth = material.map.image.width;
                                    imageHeight = material.map.image.height;
                                }
                                // sprite.material.rotation += 0.1 * ( i / l );
                                value.scale.set(scale * imageWidth, scale * imageHeight, 1.0);
                            });
                        }
                        angular.forEach(group.sprites, function(object) {
                            object.visible = visisbility;
                        });
                        angular.forEach(group.objects, function(object) {
                            object.visible = visisbility;
                        });
                    });
                }
                this.renderer.render(scene, camera);
            };

            function setHelperVisiblity(visisbility) {
                if (helpers) {
                    angular.forEach(helpers, function(value, key) {
                        value.object.visible = visisbility;
                    });
                }
            }

            this.setNewSize = function(newWidth, newHeight) {
                camera.aspect = newWidth / newHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(newWidth, newHeight);
            };

            this.setOrientationInfo = function(orientationInfo) {
                camera.quaternion.setFromEuler(orientationInfo.eulerOrientation);
                camera.quaternion.multiply(orientationInfo.backCamMultiplier);
                camera.quaternion.multiply(orientationInfo.screenAdjustment);
            };

            this.setCameraPosition = function(x, y, z) {
                var newX = x + camera.position.x;
                var newY = y + camera.position.y;
                var newZ = z + camera.position.z;
                camera.position.set(newX, newY, newZ);
            };

            this.getHelpers = function() {
                return helpers;
            }

        }

        function addHelpers(scene) {
            var helpers = [];

            var rollOverGeo = new THREE.BoxGeometry(50, 50, 50);
            var rollOverMaterial = new THREE.MeshBasicMaterial({
                color: 0xff0000,
                opacity: 0.5,
                transparent: true
            });
            var rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
            scene.add(rollOverMesh);
            helpers.push({
                name: 'cursor',
                object: rollOverMesh
            });

            var gridHelper = new THREE.GridHelper(2000, 100);
            scene.add(gridHelper);
            helpers.push({
                name: 'grid',
                object: gridHelper
            });

            helperDeferred.resolve(helpers);
        }
    }
})();