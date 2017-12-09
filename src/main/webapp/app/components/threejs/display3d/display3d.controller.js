(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('Display3DController', Display3DController);

    Display3DController.$inject = ['$rootScope', '$scope', '$element', 'ThreejsSceneService', 'OrientationCalculator'];

    function Display3DController($rootScope, $scope, $element, ThreejsSceneService, OrientationCalculator) {
        var vm = this;
        vm.isinitiator = $scope.isinitiator;
        var oldVideoHeight = 640;
        var oldVideoWidth = 480;
        var rootWidth = $(".well")[0].childNodes[0].clientWidth;
        var view;
        var groups;
        var canvas;

        $scope.$on('request-animation', function(event, args) {
            if (args) {
                groups = args;
            }
            animate();
        });
        $scope.$on('set-camera-and-resize', function(event, args) {
            setCamera(args.deviceEvent);
        });
        $scope.$on('just-resize', function(event, args) {
            resize3dModell(args);
        });
        $scope.$on('reset-3d', function(event, message) {
            ThreejsSceneService.resetScene();
        });
        $scope.$on('$destroy', function(event, message) {
            canvas.removeEventListener("mousedown", onMouseDown, false);
            canvas.removeEventListener("mousemove", onMouseMove, false);
        });

        function init3D() {
            canvas = document.querySelector("#userCanvas");
            canvas.width = oldVideoHeight;
            canvas.height = oldVideoWidth;
            var camera = ThreejsSceneService.getCamera();
            view = ThreejsSceneService.getView(canvas, oldVideoWidth, oldVideoHeight, camera, true, 0x000000, 0);
            var expertStatus = !vm.isinitiator;
            view.isExpert(expertStatus);

            if (expertStatus) {
                canvas.addEventListener("mousedown", onMouseDown, false);
                canvas.addEventListener("mousemove", onMouseMove, false);
            }
            animate();
        }

        function onMouseDown(event) {
            $rootScope.$broadcast('mouse-down', event);
        }

        function onMouseMove(event) {
            $rootScope.$broadcast('mouse-move', event);
        }

        function setCamera(deviceEvent) {
            if (deviceEvent) {
                var orientationInfo = OrientationCalculator.calculateOrientation(deviceEvent, null);
                view.setOrientationInfo(orientationInfo);
            }
            animate();
        }

        function animate() {
            window.requestAnimationFrame(renderViews);
        }

        function renderViews() {
            view.render(groups);
        }

        function resize3dModell(size) {
            var height = size.height;
            var width = size.width;
            if (height != null && height != oldVideoHeight) {
                oldVideoHeight = height;
            }
            if (width != null && width != oldVideoWidth) {
                oldVideoWidth = width;
            }
            view.setNewSize(oldVideoWidth, oldVideoHeight);
            animate();
        }

        init3D();
    }
})();