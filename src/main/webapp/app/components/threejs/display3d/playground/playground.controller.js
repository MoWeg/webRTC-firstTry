(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('PlaygroundController', PlaygroundController);

    PlaygroundController.$inject = ['$scope', '$element', 'ThreejsSceneService'];

    function PlaygroundController($scope, $element, ThreejsSceneService) {
      var vm = this;
      var primaryCam = $scope.primarycam;
      var secondaryCam = $scope.secondarycam;
      var view;

      vm.applyClasses = function() {
        return $scope.reqclass;
      }

      $scope.$on('request-animation', function(event, args) {
        view.render(args);
      });


      function init3D(){
        var canvas = $element[0].childNodes[0];

        var w = 640, h = 640;
        var fullWidth = w * 2;
        var fullHeight = h * 2;
        canvas.width = fullWidth;
        canvas.height = fullHeight;

        // var expertCam = ThreejsSceneService.getCamera(w,h,1,30000, 900, 900, 1600);
        view = ThreejsSceneService.getView(canvas, w, h, primaryCam, false, 0xffffff, 1);
        view.addSecondaryCam(secondaryCam);
        view.render();
      }
      init3D();
    }
})();
