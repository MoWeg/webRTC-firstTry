(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('Display3DController', Display3DController);

    Display3DController.$inject = ['$rootScope','$scope', '$element', 'ThreejsSceneService', 'OrientationCalculator'];

    function Display3DController($rootScope, $scope, $element, ThreejsSceneService, OrientationCalculator) {
      var vm = this;
      // var id = Math.round((Math.random() * 1000000) * 10);
      var primaryCam = $scope.primarycam;
      var oldVideoHeight = 640;
      var oldVideoWidth = 400;
      var view;

      vm.applyClasses = function() {
        return $scope.reqclass;
      }

      $scope.$on('request-animation', function(event, args) {
        view.render(args);
      });
      $scope.$on('display3d-cam-received', function(event, args) {
        secondaryCamSendSuccess = true;
      });
      $scope.$on('set-camera-and-resize', function(event, args) {
        setCamera(args.deviceEvent, args.size);
      });
      $scope.$on('just-resize', function(event, args) {
        resize3dModell(args.height, args.width);
      });


      function init3D(){
        var canvas = $element[0].childNodes[0];

        canvas.width = oldVideoHeight;
        canvas.height = oldVideoWidth;

        // var userCam = ThreejsSceneService.getCamera(oldVideoWidth,oldVideoHeight,1,10000,500,800,1300);
        view = ThreejsSceneService.getView(canvas, oldVideoWidth, oldVideoHeight, primaryCam, true, 0x000000, 0);

        view.render();
      }

      function setCamera(deviceEvent, size){
        if(size){
          resize3dModell(size.height, size.width);
        }
        if(deviceEvent){
          var orientationInfo = OrientationCalculator.calculateOrientation(deviceEvent, null);
          view.setOrientationInfo(orientationInfo);
        }
        view.render();
      }

      function resize3dModell(height, width){
        if(height != null && height != oldVideoHeight){
          oldVideoHeight = height;
        }
        if(width != null && width != oldVideoWidth){
          oldVideoWidth = width;
        }
        view.setNewSize(oldVideoWidth, oldVideoHeight);
      }

      init3D();
    }
})();
