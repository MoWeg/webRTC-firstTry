(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('Display3DController', Display3DController);

    Display3DController.$inject = ['$rootScope','$scope', '$element', 'ThreejsSceneService'];

    function Display3DController($rootScope, $scope, $element, ThreejsSceneService) {
      var vm = this;
      // var id = Math.round((Math.random() * 1000000) * 10);;
      var secondaryCamSendSuccess = false;
      var view;

      vm.applyClasses = function() {
        return $scope.reqclass;
      }

      $scope.$on('request-animation', function(event, args) {
        view.render(args);
        if(!secondaryCamSendSuccess){
          $rootScope.$broadcast('display3d-cam-send', userCam);
        }
      });
      $scope.$on('display3d-cam-received', function(event, args) {
        secondaryCamSendSuccess = true;
      });


      function init3D(){
        var canvas = $element[0].childNodes[0];

        var w = 640, h = 640;
        var fullWidth = w * 2;
        var fullHeight = h * 2;
        canvas.width = fullWidth;
        canvas.height = fullHeight;

        var userCam = ThreejsSceneService.getCamera(400,640,1,10000,500,800,1300);
        view = ThreejsSceneService.getView(canvas, 400, 640, userCam, true, 0x000000, 0);

        view.render();


      }
      init3D();
    }
})();
