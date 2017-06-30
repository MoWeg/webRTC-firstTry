(function() {
    'use strict';
    /* globals SockJS, Stomp */

    angular
        .module('simpleWebrtcServerApp')
        .factory('OrientationCalculator', OrientationCalculator);

    OrientationCalculator.$inject = [];

    function OrientationCalculator () {
        // Variables for Orientation
        var zee = new THREE.Vector3( 0, 0, 1 );
        var euler = new THREE.Euler();
        var q0 = new THREE.Quaternion();
        var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) );
        var lastEvent = {};
        var alphaOffsetAngle = 0;
        var alpha = 0;

        // Variables for Distance
        var defaultBaseVelocity = {
            x : 0,
            y : 0,
            z : 0
          };
        var threshold = {
          x : 0.2,
          y : 0.2,
          z : 0.5,
        }
        var baseVelocity = defaultBaseVelocity;
        var intervalInSeconds = 0;
        var factorUnitsPerMeter = 0;

        // the service;
        var service = {
          calculateOrientation: calcOrient,
          calculateDistance: calcDist,
          setBaseLine : setBase
        };
        return service;

        // calculate orientation
        function calcOrient(newEvent, orientation){
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

        // calculate distance
        function calcDist(newEvent, factor){
          intervalInSeconds = event.interval*0.001;
          factorUnitsPerMeter = factor;

          var unitsRight = calcuteEverythingForDimension(event, 'x');
          var unitsUp = calcuteEverythingForDimension(event, 'y');
          var unitsForward = calcuteEverythingForDimension(event, 'z');
          
          var result = {
            right : unitsRight,
            up : unitsUp,
            forward : unitsForward
          }
          return result;
        }

        function calcuteEverythingForDimension(deviceEvent, dimension){
          var acceleration = deviceEvent.acceleration[dimension];
          var unitsInDimension = 0;
          if(isBiggerThenThreshold(acceleration, threshold[dimension])){
            var oldBaseVelocity = baseVelocity[dimension];
            unitsInDimension = calculateDistanceForDimension(acceleration, oldBaseVelocity);
            baseVelocity[dimension] = calculateBaseVelocity(acceleration, oldBaseVelocity);
          }else{
            baseVelocity[dimension] = 0;
          }
          return unitsInDimension;
        }

        function isBiggerThenThreshold(value, base){
          return value >= base || value <= - base;
        }

        function calculateDistanceForDimension(dimensionAcc, dimensionBaseVelo){
            var sqIntervalInSecs = intervalInSeconds*intervalInSeconds;
            var resultInMeters = 0.5*dimensionAcc*sqIntervalInSecs + dimensionBaseVelo*intervalInSeconds;
            var resultInUnits = factorUnitsPerMeter*resultInMeters;
            return resultInUnits;
        }
        function calculateBaseVelocity(dimensionAcc, dimensionBaseVelo){
            var result = dimensionAcc*intervalInSeconds + dimensionBaseVelo;
            return result;
        }

        function setBase(newEvent){
          var factor = 2;
          threshold.x =  normalize(event.acceleration.x)*factor;
          threshold.y =  normalize(event.acceleration.y)*factor;
          threshold.z  =  normalize(event.acceleration.z)*factor;
          console.log("baseX: "+baseX+" baseY: "+baseY+" baseZ: "+baseZ);
        }
    }
})();
