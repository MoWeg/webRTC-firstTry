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
        var baseVelocity = defaultBaseVelocity;
        var intervalInSeconds = 0;
        var factorUnitsPerMeter = 0;
        var xWasPositive = true;
        var yWasPositive = true;
        var zWasPositive = true;

        var baseX = 0.5;
        var baseY = 0.5;
        var baseZ = 0.5;

        // the service;
        var service = {
          calculateOrientation: calcOrient,
          calculateDistance: calcDist,
          setBaseLine : setBase
        };
        return service;


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

        function calcDist(newEvent, factor){
          intervalInSeconds = event.interval*0.001;
          var workingX = event.acceleration.x;
          var workingY = event.acceleration.y;
          var workingZ = event.acceleration.z;
          var unitsRight = 0;
          var unitsUp = 0;
          var unitsForward = 0;
          factorUnitsPerMeter = factor;
          /*
          if(isBiggerThenThreshold(workingX, baseX)){
            unitsRight =  calculateDistanceForDimension(workingX, baseVelocity.x, xWasPositive);
            baseVelocity['x'] = calculateBaseVelocity(workingX, baseVelocity.x, xWasPositive);
            xWasPositive = isPositive(workingX);
          } else {
            workingX = 0;
          }

          if(isBiggerThenThreshold(workingY, baseY)){
            unitsUp = calculateDistanceForDimension(workingZ, baseVelocity.y, yWasPositive);
            baseVelocity['y'] = calculateBaseVelocity(workingY, baseVelocity.y, yWasPositive);
            yWasPositive = isPositive(workingY);
          } else {
            workingY = 0;
          }

          if(isBiggerThenThreshold(workingZ, baseZ)){
            unitsForward =  calculateDistanceForDimension(workingZ, baseVelocity.z, zWasPositive);
            baseVelocity['z'] = calculateBaseVelocity(workingZ, baseVelocity.z, zWasPositive);
            zWasPositive = isPositive(workingZ);
          } else {
            workingZ = 0;
          }
          */

          if(isBiggerThenThreshold(workingX, baseX)||isBiggerThenThreshold(workingZ, baseZ)||isBiggerThenThreshold(workingY, baseY)){
            unitsRight =  calculateDistanceForDimension(workingX, baseVelocity.x, xWasPositive);
            baseVelocity['x'] = calculateBaseVelocity(workingX, baseVelocity.x, xWasPositive);
            xWasPositive = isPositive(workingX);

            unitsUp = calculateDistanceForDimension(workingZ, baseVelocity.y, yWasPositive);
            baseVelocity['y'] = calculateBaseVelocity(workingY, baseVelocity.y, yWasPositive);
            yWasPositive = isPositive(workingY);
      
            unitsForward =  calculateDistanceForDimension(workingZ, baseVelocity.z, zWasPositive);
            baseVelocity['z'] = calculateBaseVelocity(workingZ, baseVelocity.z, zWasPositive);
            zWasPositive = isPositive(workingZ);
          } else {
            workingX = 0;
            workingY = 0;
            workingZ = 0;
          }

          var result = {
            right : unitsRight,
            up : unitsUp,
            forward : unitsForward
          }
          return result;
        }

        function isBiggerThenThreshold(value, base){
           //var threshold = 0.5;
           //return value >= threshold || value <= - threshold;

          //var normalizedValue = normalize(value);
          //console.log("normalizedValue: "+normalizedValue +" base: "+base);
          //return normalizedValue >= base;

          //return true;

          return value >= base || value <= - base;
        }
        function isPositive(value){
          return value > 0;
        }
        function directionChangedForDimension(value, dimensionWasPositive){
          if(value < 0 && dimensionWasPositive){
            return true;
          }
          if(value > 0 && !dimensionWasPositive){
            return true;
          }
          return false;
        }

        function calculateDistanceForDimension(dimensionAcc, dimensionBaseVelo, dimensionWasPositive){
            if(directionChangedForDimension(dimensionAcc, dimensionWasPositive)){
              dimensionBaseVelo = 0;
            }
            var sqIntervalInSecs = intervalInSeconds*intervalInSeconds;
            var resultInMeters = 0.5*dimensionAcc*sqIntervalInSecs + dimensionBaseVelo*intervalInSeconds;
            var resultInUnits = factorUnitsPerMeter*resultInMeters;
            return resultInUnits;
        }
        function calculateBaseVelocity(dimensionAcc, dimensionBaseVelo, dimensionWasPositive){
            if(directionChangedForDimension(dimensionAcc, dimensionWasPositive)){
              return 0;
            }
            var result = dimensionAcc*intervalInSeconds + dimensionBaseVelo;
            return result;
        }

        function setBase(newEvent){
          var factor = 2;
          baseX =  normalize(event.acceleration.x)*factor;
          baseY =  normalize(event.acceleration.y)*factor;
          baseZ =  normalize(event.acceleration.z)*factor;
          console.log("baseX: "+baseX+" baseY: "+baseY+" baseZ: "+baseZ);
        }

        function normalize(value){
          if(value < 0){
            return -value;
          }else{
            return value;
          }
        }
    }
})();
