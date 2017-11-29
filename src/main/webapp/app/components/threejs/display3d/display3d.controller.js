(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('Display3DController', Display3DController);

    Display3DController.$inject = ['$rootScope', '$scope', '$element', 'ThreejsSceneService', 'OrientationCalculator'];

    function Display3DController($rootScope, $scope, $element, ThreejsSceneService, OrientationCalculator) {
        var vm = this;
        var userCam = $scope.usercam;
        var expertCam = $scope.expertcam;
        vm.isinitiator = $scope.isinitiator;
        var oldVideoHeight = 640;
        var oldVideoWidth = 400;
        var rootWidth = $(".well")[0].childNodes[0].clientWidth;
        var view;
        var expertView;
        var groups;
        var canvas;
        var expertCanvas;
        var expertInSync = true;
        var lastOrientationInfo;

        function checkIsInit() {
            if (hasExpertCam == true) {
                return false;
            } else {
                return true;
            }
        }

        vm.onMouseMove = function(event) {
            $rootScope.$broadcast('mouse-move', event);
        }
        vm.onMouseDown = function(event) {
            $rootScope.$broadcast('mouse-down', event);
        }
        $scope.$on('request-animation', function(event, args) {
            if (args) {
                groups = args;
            }
            animate();
        });
        $scope.$on('camera-sync-change', function(event, args) {
            if (args) {
                if (args != expertInSync) {
                    expertCam.position.copy(userCam.position);
                    if (lastOrientationInfo) {
                        expertView.setOrientationInfo(lastOrientationInfo);
                    }
                }
            }
            expertInSync = args;
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

        function init3D() {
            canvas = document.querySelector("#userCanvas");

            canvas.width = oldVideoHeight;
            canvas.height = oldVideoWidth;

            view = ThreejsSceneService.getView(canvas, oldVideoWidth, oldVideoHeight, userCam, true, 0x000000, 0);

            expertCanvas = document.querySelector("#expertCanvas");
            if (!vm.isinitiator) {
                var w = 640;
                var h = 640;
                expertCanvas.width = h;
                expertCanvas.height = w;

                expertView = ThreejsSceneService.getView(expertCanvas, w, h, expertCam, false, 0xffffff, 1);
                expertView.addSecondaryCam(userCam);
            } else {
                expertCanvas.remove();
            }
            animate();
        }

        function setCamera(deviceEvent) {
            if (deviceEvent) {
                var orientationInfo = OrientationCalculator.calculateOrientation(deviceEvent, null);
                view.setOrientationInfo(orientationInfo);
                if (expertView) {
                    if (expertInSync) {
                        expertView.setOrientationInfo(orientationInfo);
                    }
                }
                lastOrientationInfo = orientationInfo;
            }
            animate();
        }

        function animate() {
            window.requestAnimationFrame(renderViews);
        }

        function renderViews() {
            view.render(groups);
            if (expertView) {
                expertView.render(groups);
            }
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
            var expertWidth = rootWidth - oldVideoWidth;
            var expertHeight = 640;
            if (expertView) {
                expertView.setNewSize(expertWidth, 640);
            }
            view.setNewSize(oldVideoWidth, oldVideoHeight);
            animate();
        }


        init3D();
    }
})();