(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('ExpertMovablesController', ExpertMovablesController);

    ExpertMovablesController.$inject = ['$scope', '$rootScope', 'ThreejsSceneService'];

    function ExpertMovablesController($scope, $rootScope, ThreejsSceneService) {
        var vm = this;
        var gridHelper;
        var scene = ThreejsSceneService.getScene(); // $s
        var newPosY;

        var movableGrid = {
            name: 'grid',
            leftOrRight: moveGridLeftOrRight,
            upOrDown: moveGridUpOrDown
        }
        vm.tabPressed = false;
        vm.activeMovable = movableGrid;

        ThreejsSceneService.getHelperPromise().then(function(helpers) {
            angular.forEach(helpers, function(value, key) {
                if (value.name == 'grid') {
                    gridHelper = value.object;
                }
            });
        });

        $scope.$on('$destroy', function() {
            document.removeEventListener('keydown', onDocumentKeyDown, false);
        });

        function init() {
            newPosY = 0;
            document.addEventListener('keydown', onDocumentKeyDown, false);
        }

        function onDocumentKeyDown(event) {
            switch (event.keyCode) {
                case 9:
                    event.preventDefault();
                    vm.tabPressed = !vm.tabPressed;
                    $scope.$apply();
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

        function moveGridUpOrDown(positive) {
            var direction = 50;
            if (!positive) {
                direction = -50;
            }
            if (vm.tabPressed) {
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

        function posYchanged() {
            $rootScope.$broadcast('cursor-y-changed', newPosY);
        }

        function animate() {
            $rootScope.$broadcast('request-animation');
        }

        init();
    }
})();