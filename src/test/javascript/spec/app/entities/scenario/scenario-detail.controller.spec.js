'use strict';

describe('Controller Tests', function() {

    describe('Scenario Management Detail Controller', function() {
        var $scope, $rootScope;
        var MockEntity, MockPreviousState, MockScenario, MockUser, MockAnnotationAsPicture, MockTask;
        var createController;

        beforeEach(inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            MockEntity = jasmine.createSpy('MockEntity');
            MockPreviousState = jasmine.createSpy('MockPreviousState');
            MockScenario = jasmine.createSpy('MockScenario');
            MockUser = jasmine.createSpy('MockUser');
            MockAnnotationAsPicture = jasmine.createSpy('MockAnnotationAsPicture');
            MockTask = jasmine.createSpy('MockTask');
            

            var locals = {
                '$scope': $scope,
                '$rootScope': $rootScope,
                'entity': MockEntity,
                'previousState': MockPreviousState,
                'Scenario': MockScenario,
                'User': MockUser,
                'AnnotationAsPicture': MockAnnotationAsPicture,
                'Task': MockTask
            };
            createController = function() {
                $injector.get('$controller')("ScenarioDetailController", locals);
            };
        }));


        describe('Root Scope Listening', function() {
            it('Unregisters root scope listener upon scope destruction', function() {
                var eventType = 'simpleWebrtcServerApp:scenarioUpdate';

                createController();
                expect($rootScope.$$listenerCount[eventType]).toEqual(1);

                $scope.$destroy();
                expect($rootScope.$$listenerCount[eventType]).toBeUndefined();
            });
        });
    });

});
