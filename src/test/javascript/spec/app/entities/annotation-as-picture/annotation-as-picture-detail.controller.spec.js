'use strict';

describe('Controller Tests', function() {

    describe('AnnotationAsPicture Management Detail Controller', function() {
        var $scope, $rootScope;
        var MockEntity, MockPreviousState, MockAnnotationAsPicture, MockScenario;
        var createController;

        beforeEach(inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            MockEntity = jasmine.createSpy('MockEntity');
            MockPreviousState = jasmine.createSpy('MockPreviousState');
            MockAnnotationAsPicture = jasmine.createSpy('MockAnnotationAsPicture');
            MockScenario = jasmine.createSpy('MockScenario');
            

            var locals = {
                '$scope': $scope,
                '$rootScope': $rootScope,
                'entity': MockEntity,
                'previousState': MockPreviousState,
                'AnnotationAsPicture': MockAnnotationAsPicture,
                'Scenario': MockScenario
            };
            createController = function() {
                $injector.get('$controller')("AnnotationAsPictureDetailController", locals);
            };
        }));


        describe('Root Scope Listening', function() {
            it('Unregisters root scope listener upon scope destruction', function() {
                var eventType = 'simpleWebrtcServerApp:annotationAsPictureUpdate';

                createController();
                expect($rootScope.$$listenerCount[eventType]).toEqual(1);

                $scope.$destroy();
                expect($rootScope.$$listenerCount[eventType]).toBeUndefined();
            });
        });
    });

});
