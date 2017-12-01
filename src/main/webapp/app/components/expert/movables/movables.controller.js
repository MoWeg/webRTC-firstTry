(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('ExpertMovablesController', ExpertMovablesController);

    ExpertMovablesController.$inject = ['$scope', '$rootScope', 'AnnotationToolService', 'ThreejsSceneService'];

    function ExpertMovablesController($scope, $rootScope, AnnotationToolService, ThreejsSceneService) {
        var vm = this;
        var gridHelper;
        var scene = ThreejsSceneService.getScene(); // $s
        var view2Cam = $scope.expertcam;
        var newPosY;
        vm.isInSync = true;

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
        vm.movables = [movableGrid, movableCam];
        vm.activeMovable = movableGrid;
        vm.syncWithUser = syncWithUser;
        vm.lookAtScene = lookAtScene;

        ThreejsSceneService.getHelperPromise().then(function(helpers) {
            angular.forEach(helpers, function(value, key) {
                if (value.name == 'grid') {
                    gridHelper = value.object;
                }
            });
        });

        $scope.$on('$destroy', function() {
            document.removeEventListener('keyup', onDocumentKeyUp, false);
            document.removeEventListener('keydown', onDocumentKeyDown, false);
        });

        function init() {
            newPosY = 0;
            document.addEventListener('keydown', onDocumentKeyDown, false);
            document.addEventListener('keyup', onDocumentKeyUp, false);
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
                    // resetCamera();
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
                posYchanged();
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
            animate();
        }

        function syncWithUser() {
            vm.isInSync = !vm.isInSync;
            $rootScope.$broadcast('camera-sync-change', vm.isInSync);
        }

        function lookAtScene() {
            view2Cam.lookAt(scene.position);
            animate();
        }

        function animate() {
            $rootScope.$broadcast('request-animation');
        }

        function posYchanged() {
            $rootScope.$broadcast('cursor-y-changed', newPosY);
        }
        init();
    }
})();