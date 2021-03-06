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

        var view2Cam = ThreejsSceneService.getCamera();
        var mouse;
        var newPosY;

        vm.tools = [];
        vm.activeTool = null;
        vm.setActiveTool = function(tool) {
            vm.activeTool = tool;
        };

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

        $scope.$on('cursor-y-changed', function(event, args) {
            newPosY = args;
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

        function init() {
            mouse = new THREE.Vector2();
            newPosY = 0;

            vm.tools = AnnotationToolService.getAnnotationTools();
            vm.activeTool = vm.tools[0];
        }

        function onDocumentMouseMove(event) {
            // event.preventDefault();window.innerWidth 1
            // mouse.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
            if (activeGroup) {
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
        }

        function calculate(event) {
            // var divisorY = $(".well")[0].childNodes[0].clientHeight + 640;
            // var divisorY = $("#userCanvas")[0].childNodes[0].clientHeight;
            // // var divisorY = window.innerHeight;
            // // var actualPlusY = 0.65;
            // var actualPlusY = 0.85;
            // // var y = -(event.clientY / divisorY) * 2 + 1;
            // // var divisorY = $(".well")[0].childNodes[0].clientHeight;
            // // var basePlusY = 1;
            // // var diffY = divisorY - event.clientY;
            // // var diffYCent = diffY / 100;
            // // var dynamicPlusY = diffYCent * 0.4;
            // // var actualPlusY = basePlusY + dynamicPlusY;
            // var y = -(event.clientY / divisorY) * 2 + actualPlusY;
            // //
            // //
            // // var divisorX = $(".well")[0].childNodes[0].clientWidth;
            // var divisorX = $("#userCanvas")[0].childNodes[0].clientWidth;
            // var baseMinusX = 2;
            // var diffX = event.clientX - divisorX;
            // var diffXCent = diffX / 100;
            // // var dynamicMinusX = diffXCent * 0.85;
            // var dynamicMinusX = diffXCent;
            // var actualMinusX = baseMinusX - dynamicMinusX;
            // var x = (event.clientX / divisorX) * 2 - actualMinusX;

            //
            // var x = (event.clientX / window.innerWidth) * 2 - 1; divisorY
            // var y = -(event.clientY / window.innerHeight) * 2 + 1;
            // var divisorY = $("#userCanvas")[0].childNodes[0].clientHeight;
            // var divisorX = $("#userCanvas")[0].childNodes[0].clientWidth;
            // var x = (event.clientX / divisorX) * 2 - 1;
            // var y = -(event.clientY / divisorY) * 2 + 1;

            var canvasWidth = $("#userCanvas")[0].childNodes[0].clientWidth;
            var canvasHeigth = $("#userCanvas")[0].childNodes[0].clientHeight;
            // console.warn({
            //     x: event.clientX / divisorX - 0.85, // 0 is left
            //     y: event.clientY / divisorY - 0.15 // 0 is top
            // });
            // var offsetY = (canvasHeigth / canvasWidth) / 2;
            // var offsetX = (canvasWidth / canvasHeigth) / 2;
            if (canvasHeigth > canvasWidth) {
                // var offsetX = ((canvasHeigth / canvasWidth) / 2) + 0.75;
                // var offsetY = ((canvasWidth / canvasHeigth) / 2) + 0.25;
                var offsetX = (canvasHeigth / canvasWidth);
                var offsetY = (canvasWidth / canvasHeigth) - 0.1;
            } else {
                //  var offset = (canvasHeigth / canvasWidth) / 2;
                // var offsetX = ((canvasWidth / canvasHeigth) / 2) + 0.50;
                // var offsetY = ((canvasHeigth / canvasWidth) / 2) + 0.25;
                var offsetX = (canvasWidth / canvasHeigth) - 0.2;
                var offsetY = (canvasHeigth / canvasWidth);
            }
            //
            // var offsetX = offset;
            // var offsetY = offset;
            // console.warn({
            //     x: (event.clientX / canvasWidth - offsetX), // 0 is left
            //     y: -(event.clientY / canvasHeigth - offsetY) // 0 is top
            // });


            var x = (event.clientX / canvasWidth - offsetX) * 2;
            var y = -(event.clientY / canvasHeigth - offsetY) * 2;
            return {
                x: x,
                y: y
            };
        }

        function onDocumentMouseDown(event) {
            // event.preventDefault();
            if (activeGroup) {
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

        }

        function animate() {
            $rootScope.$broadcast('request-animation');
        }
        init();
    }
})();