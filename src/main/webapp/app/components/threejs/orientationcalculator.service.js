(function() {
    'use strict';
    /* globals SockJS, Stomp */

    angular
        .module('simpleWebrtcServerApp')
        .factory('OrientationCalculator', OrientationCalculator);

    OrientationCalculator.$inject = [];

    function OrientationCalculator() {
        // Variables for Orientation
        var zee = new THREE.Vector3(0, 0, 1);
        var euler = new THREE.Euler();
        var q0 = new THREE.Quaternion();
        var q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
        var lastEvent = {};
        var alphaOffsetAngle = 0;
        var alpha = 0;

        // Variables for Distance
        var defaultBaseVelocity = {
            x: 0,
            y: 0,
            z: 0
        };

        var baseVelocity = defaultBaseVelocity;
        var intervalInSeconds = 0;
        var factorUnitsPerMeter = 0;
        var motionQuaterion = new THREE.Quaternion();
        var quaternionWasSet = false;

        var sampledThreshold = {
            x: {
                upper: -1,
                lower: 1,
                sum: 0,
                average: 0
            },
            y: {
                upper: -1,
                lower: 1,
                sum: 0,
                average: 0
            },
            z: {
                upper: -1,
                lower: 1,
                sum: 0,
                average: 0
            }
        }
        var calibrationTimeInMillis = 1000; //one second of sampling
        var actualSampleSize = 0;
        var needsCalibration = true;
        // the service;
        var service = {
            calculateOrientation: calcOrient,
            calculateDistance: calcDist,
            calculateDistanceWithOrientation: calcDistWithQ
        };
        return service;

        // calculate orientation
        function calcOrient(newEvent, orientation) {
            var event = {};
            if (newEvent) {
                event = newEvent;
            } else {
                event = lastEvent;
            }

            euler = new THREE.Euler();
            q0 = new THREE.Quaternion();

            var workingAlpha = event.alpha ? THREE.Math.degToRad(event.alpha) + alphaOffsetAngle : 0; // Z
            var beta = event.beta ? THREE.Math.degToRad(event.beta) : 0; // X'
            var gamma = event.gamma ? THREE.Math.degToRad(event.gamma) : 0; // Y''
            var orient = orientation ? THREE.Math.degToRad(orientation) : 0;
            workingAlpha = alpha;
            lastEvent = newEvent;

            euler.set(beta, alpha, -gamma, 'YXZ');
            motionQuaterion.setFromEuler(euler);
            quaternionWasSet = true;

            return {
                eulerOrientation: euler, // 'ZXY' for the device, but 'YXZ' for us
                backCamMultiplier: q1,
                screenAdjustment: q0.setFromAxisAngle(zee, -orient)
            }
        }

        // calculate distance
        function calcDistWithQ(deviceAcceleration, factor) {
            var distance = calcDist(deviceAcceleration, factor);
            if (quaternionWasSet) {
                var distanceVector = new THREE.Vector3(distance.right, distance.up, distance.forward);
                //var distanceVector = new THREE.Vector3(0, 0, distance.unitsForward);
                distanceVector.applyQuaternion(motionQuaterion);
                distance.right = distanceVector.y;
                distance.up = distanceVector.z;
                distance.forward = distanceVector.x;
            }
            return distance;
        }

        function calcDist(deviceAcceleration, factor) {
            intervalInSeconds = deviceAcceleration.interval * 0.001;
            factorUnitsPerMeter = factor;
            var result = {
                right: 0,
                up: 0,
                forward: 0
            }

            if (needsCalibration) {
                setThreshold(deviceAcceleration);
            } else {
                result.right = calcuteEverythingForDimension(deviceAcceleration, 'x');
                result.up = calcuteEverythingForDimension(deviceAcceleration, 'y');
                result.forward = calcuteEverythingForDimension(deviceAcceleration, 'z');
            }

            return result;
        }

        function calcuteEverythingForDimension(deviceAcceleration, dimension) {
            var acceleration = deviceAcceleration[dimension];
            var unitsInDimension = 0;
            if (compareToBounds(acceleration, sampledThreshold[dimension])) {
                var workingAcceleration = acceleration - sampledThreshold[dimension].average;
                var oldBaseVelocity = baseVelocity[dimension];
                unitsInDimension = calculateDistanceForDimension(workingAcceleration, oldBaseVelocity);
                baseVelocity[dimension] = calculateBaseVelocity(workingAcceleration, oldBaseVelocity);
            } else {
                baseVelocity[dimension] = 0;
            }
            return unitsInDimension;
        }

        function compareToBounds(value, bounds) {
            if (value >= bounds.upper) {
                return true;
            }
            if (value <= bounds.lower) {
                return true;
            }
            return false;
        }

        function calculateDistanceForDimension(dimensionAcc, dimensionBaseVelo) {
            var sqIntervalInSecs = intervalInSeconds * intervalInSeconds;
            var resultInMeters = 0.5 * dimensionAcc * sqIntervalInSecs + dimensionBaseVelo * intervalInSeconds;
            var resultInUnits = factorUnitsPerMeter * resultInMeters;
            return resultInUnits;
        }

        function calculateBaseVelocity(dimensionAcc, dimensionBaseVelo) {
            var result = dimensionAcc * intervalInSeconds + dimensionBaseVelo;
            return result;
        }

        function setThreshold(deviceAcceleration) {
            var requiredSampleSize = calibrationTimeInMillis / deviceAcceleration.interval;
            setThresholdForDimension(deviceAcceleration, 'x');
            setThresholdForDimension(deviceAcceleration, 'y');
            setThresholdForDimension(deviceAcceleration, 'z');
            actualSampleSize++;
            if (actualSampleSize >= requiredSampleSize) {
                needsCalibration = false;
                angular.forEach(sampledThreshold, function(value, key) {
                    var sum = value.sum;
                    value.average = sum / actualSampleSize;
                });
                //console.log(sampledThreshold);
            }
        }

        function setThresholdForDimension(deviceAcceleration, dimension) {
            var bounds = sampledThreshold[dimension];
            var acceleration = deviceAcceleration[dimension];
            if (acceleration >= bounds.upper) {
                bounds.upper = acceleration;
            }
            if (acceleration <= bounds.lower) {
                bounds.lower = acceleration;
            }
            bounds.sum += acceleration;
        }
    }
})();