(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('FullscreenButtonController', FullscreenButtonController);

    FullscreenButtonController.$inject = ['$scope'];

    function FullscreenButtonController($scope) {
        var vm = this;
        var isFullScreen = false;
        var rootElement = document.querySelector("#relevantForFullScreen");

        vm.determineGlyhpicon = determineGlyhpicon;
        vm.handleClick = handleClick;

        $scope.$on('rtc-hangup', function() {
            exitFullScreen();
        });

        function determineGlyhpicon() {
            isFullScreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
            var glyphicon
            if (isFullScreen) {
                glyphicon = "glyphicon glyphicon-resize-small"
            } else {
                glyphicon = "glyphicon glyphicon-resize-full"
            }
            return glyphicon;
        }

        function handleClick() {
            if (isFullScreen) {
                exitFullScreen();
                isFullScreen = false;
            } else {
                requestFullScreen(rootElement);
                isFullScreen = true;
            }
        }

        function requestFullScreen(element) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            }
        }

        function exitFullScreen() {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
})();