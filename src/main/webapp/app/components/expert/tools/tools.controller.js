(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('ExpertToolsController', ExpertToolsController);

    ExpertToolsController.$inject = ['$scope', '$rootScope', 'AnnotationToolService', 'ThreejsSceneService'];

    function ExpertToolsController($scope, $rootScope, AnnotationToolService, ThreejsSceneService) {
        var vm = this;
        var activeGroup;
        var scene = ThreejsSceneService.getScene(); // $scope.scene;
        var raycaster = new THREE.Raycaster();
        var rollOverMesh;
        var gridHelper;

        var view2Cam = $scope.expertcam;
        var mouse;
        var newPosY;

        var movableGrid = {
            name: 'grid',
            leftOrRight: moveGridLeftOrRight,
            upOrDown: moveGridUpOrDown
        }
        var movableCam = {
            name: 'camera',
            leftOrRight: moveCamLeftOrRight,
            upOrDown: moveCamUpOrDown
        }
        var tabPressed = false;

        vm.tools = [];
        vm.activeTool = null;
        vm.movables = [];
        vm.activeMovable = movableGrid;
        vm.setActiveTool = function(tool) {
            vm.activeTool = tool;
        };
        vm.setActiveMovable = function(movable) {
            vm.activeMovable = movable;
        }

        ThreejsSceneService.getHelperPromise().then(function(helpers) {
            angular.forEach(helpers, function(value, key) {
                if (value.name == 'cursor') {
                    rollOverMesh = value.object;
                }
                if (value.name == 'grid') {
                    gridHelper = value.object;
                }
            });
        });

        $scope.$on('active-group-changed', function(event, args) {
            activeGroup = args;
        });
        $scope.$on('mouse-move', function(event, args) {
            onDocumentMouseMove(args);
        });
        $scope.$on('mouse-down', function(event, args) {
            onDocumentMouseDown(args);
        });
        $scope.$on('$destroy', function() {
            document.removeEventListener('keydown', onDocumentKeyDown, false);
            document.removeEventListener('keyup', onDocumentKeyUp, false);
        });

        function init() {
            mouse = new THREE.Vector2();
            newPosY = 0;

            vm.tools = AnnotationToolService.getAnnotationTools();

            vm.movables.push(movableGrid);
            vm.movables.push(movableCam);

            document.addEventListener('keydown', onDocumentKeyDown, false);
            document.addEventListener('keyup', onDocumentKeyUp, false);
        }

        function onDocumentMouseMove(event) {
            // event.preventDefault();window.innerWidth 1
            // mouse.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);

            var position = calculate(event);
            mouse.set(position.x, position.y);
            raycaster.setFromCamera(mouse, view2Cam);
            var intersects = raycaster.intersectObjects(activeGroup.objects, true);
            if (intersects.length > 0) {
                var intersect = intersects[0];
                intersect.point.y = intersect.point.y + newPosY;
                rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
                rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
            }
            animate();
        }

        function calculate(event) {
            // var divisorY = $(".well")[0].childNodes[0].clientHeight + 640;
            var divisorY = window.innerHeight;
            var actualPlusY = 0.65;
            // var y = -(event.clientY / divisorY) * 2 + 1;
            // var divisorY = $(".well")[0].childNodes[0].clientHeight;
            // var basePlusY = 1;
            // var diffY = divisorY - event.clientY;
            // var diffYCent = diffY / 100;
            // var dynamicPlusY = diffYCent * 0.4;
            // var actualPlusY = basePlusY + dynamicPlusY;
            var y = -(event.clientY / divisorY) * 2 + actualPlusY;


            var divisorX = $(".well")[0].childNodes[0].clientWidth;
            var baseMinusX = 2;
            var diffX = event.clientX - divisorX;
            var diffXCent = diffX / 100;
            var dynamicMinusX = diffXCent * 0.85;
            var actualMinusX = baseMinusX - dynamicMinusX;
            var x = (event.clientX / divisorX) * 2 - actualMinusX;

            return {
                x: x,
                y: y
            };
        }

        function onDocumentMouseDown(event) {
            // event.preventDefault();
            var position = calculate(event);
            mouse.set(position.x, position.y);
            raycaster.setFromCamera(mouse, view2Cam);
            var intersects = raycaster.intersectObjects(activeGroup.objects, true);
            if (intersects.length > 0) {
                var intersect = intersects[0];
                if (vm.activeTool && activeGroup) {
                    intersect.point.y = intersect.point.y + newPosY;
                    vm.activeTool.actionManager.action(intersect, scene, activeGroup);
                }
                animate();
            }
        }

        function onDocumentKeyDown(event) {
            switch (event.keyCode) {
                case 9:
                    event.preventDefault();
                    tabPressed = !tabPressed;
                    break;
                case 16:
                    isShiftDown = true;
                    break;
                case 27:
                    event.preventDefault();
                    resetCamera();
                    break;
                case 65:
                case 37:
                    event.preventDefault();
                    vm.activeMovable.leftOrRight(false);
                    break;
                case 87:
                case 38:
                    event.preventDefault();
                    vm.activeMovable.upOrDown(true);
                    break;
                case 68:
                case 39:
                    event.preventDefault();
                    vm.activeMovable.leftOrRight(true);
                    break;
                case 83:
                case 40:
                    event.preventDefault();
                    vm.activeMovable.upOrDown(false);
                    break;
            }
        }

        function onDocumentKeyUp(event) {
            switch (event.keyCode) {
                case 16:
                    isShiftDown = false;
                    break;
            }
        }

        function moveGridUpOrDown(positive) {
            var direction = 50;
            if (!positive) {
                direction = -50;
            }
            if (tabPressed) {
                var oldPos = gridHelper.position.z;
                gridHelper.position.z = oldPos + direction;
            } else {
                var oldPos = gridHelper.position.y;
                newPosY = oldPos + direction;
                gridHelper.position.y = newPosY;
            }
            animate();
        }

        function moveGridLeftOrRight(positive) {
            var direction = 50;
            if (!positive) {
                direction = -50;
            }
            var oldPos = gridHelper.position.x;
            gridHelper.position.x = oldPos + direction;
            animate();
        }

        function moveCamLeftOrRight(positive) {
            var direction = 200;
            if (!positive) {
                direction = -200;
            }
            var oldPos = view2Cam.position.x;
            view2Cam.position.x = oldPos + direction;
            view2Cam.lookAt(scene);
            animate();
        }

        function moveCamUpOrDown(positive) {
            var direction = -200;
            if (!positive) {
                direction = 200;
            }
            if (tabPressed) {
                var oldPos = view2Cam.position.y;
                view2Cam.position.y = oldPos + direction;
            } else {
                var oldPos = view2Cam.position.z;
                view2Cam.position.z = oldPos + direction;
            }
            view2Cam.lookAt(scene);
            animate();
        }

        function resetCamera() {
            view2Cam.position.set(900, 900, 1600);
            animate();
        }

        function animate() {
            $rootScope.$broadcast('request-animation', $scope.threejsgroups);
        }
        init();
    }
})();