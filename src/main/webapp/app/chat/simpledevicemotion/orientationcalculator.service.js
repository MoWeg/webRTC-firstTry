(function() {
    'use strict';
    /* globals SockJS, Stomp */

    angular
        .module('simpleWebrtcServerApp')
        .factory('OrientationCalculator', OrientationCalculator);

    OrientationCalculator.$inject = [];

    function OrientationCalculator () {
        var service = {
          calculate: calculateOrientation
        };
        var zee = new THREE.Vector3( 0, 0, 1 );

        var euler = new THREE.Euler();

        var q0 = new THREE.Quaternion();

        var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) );

        var lastEvent = {};

        var alphaOffsetAngle = 0;

        var alpha = 0;

        function calculateOrientation(newEvent, orientation){
          var event = {};
          if(newEvent){
            event = newEvent;
          }else{
            event = lastEvent;
          }

          euler = new THREE.Euler();
          q0 = new THREE.Quaternion();

          var workingAlpha = event.alpha ? THREE.Math.degToRad( event.alpha ) + alphaOffsetAngle : 0; // Z
          var beta = event.beta ? THREE.Math.degToRad(event.beta ) : 0; // X'
          var gamma = event.gamma ? THREE.Math.degToRad( event.gamma ) : 0; // Y''
          var orient = orientation ? THREE.Math.degToRad( orientation ) : 0;
          workingAlpha = alpha;
          lastEvent = newEvent;

          return {
            eulerOrientation: euler.set( beta, alpha, - gamma, 'YXZ' ), // 'ZXY' for the device, but 'YXZ' for us
            backCamMultiplier: q1,
            screenAdjustment:  q0.setFromAxisAngle( zee, - orient )
          }
        }
        return service;
    }
})();
