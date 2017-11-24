(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('Display3DController', Display3DController);

    Display3DController.$inject = ['$rootScope', '$scope', '$element', 'ThreejsSceneService', 'OrientationCalculator'];

    function Display3DController($rootScope, $scope, $element, ThreejsSceneService, OrientationCalculator) {
        var vm = this;
        // var id = Math.round((Math.random() * 1000000) * 10);
        var userCam = $scope.usercam;
        var expertCam = $scope.expertcam;
        vm.isinitiator = $scope.isinitiator;
        $scope.expert = !vm.isinitiator;
        var oldVideoHeight = 640;
        var oldVideoWidth = 400;
        var view;
        var expertView;

        function checkIsInit() {
            if (hasExpertCam == true) {
                return false;
            } else {
                return true;
            }
        }
        vm.applyClasses = function() {
            return $scope.reqclass;
        }
        vm.onMouseMove = function(event) {
            // console.log(event);
            $rootScope.$broadcast('mouse-move', event);
        }
        vm.onMouseDown = function(event) {
            $rootScope.$broadcast('mouse-down', event);
        }

        $scope.$on('request-animation', function(event, args) {
            view.render(args);
            expertView.render(args);
        });
        $scope.$on('set-camera-and-resize', function(event, args) {
            setCamera(args.deviceEvent);
        });
        $scope.$on('just-resize', function(event, args) {
            console.log("resize " + args.height + " " + args.width);
            resize3dModell(args);
        });

        function init3D() {
            var canvas = document.querySelector("#userCanvas");

            canvas.width = oldVideoHeight;
            canvas.height = oldVideoWidth;

            view = ThreejsSceneService.getView(canvas, oldVideoWidth, oldVideoHeight, userCam, true, 0x000000, 0);

            view.render();
            var expertCanvas = document.querySelector("#expertCanvas");
            if (!vm.isinitiator) {
                var w = 640,
                    h = 640;
                var fullWidth = w * 2;
                var fullHeight = h * 2;
                expertCanvas.width = fullWidth;
                expertCanvas.height = fullHeight;

                expertView = ThreejsSceneService.getView(expertCanvas, w, h, expertCam, false, 0xffffff, 1);
                expertView.addSecondaryCam(userCam);
                expertView.render();
            } else {
                expertCanvas.remove();
            }
        }

        function setCamera(deviceEvent) {
            if (deviceEvent) {
                var orientationInfo = OrientationCalculator.calculateOrientation(deviceEvent, null);
                view.setOrientationInfo(orientationInfo);
            }
            view.render();
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
        }

        init3D();
    }
})();