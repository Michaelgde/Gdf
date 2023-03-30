const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');
const {
  generateCompiledEventsForEventsFunction,
  generateCompiledEventsFromSerializedEvents,
} = require('../TestUtils/CodeGenerationHelpers.js');

describe('libGD.js - GDJS Code Generation integration tests', () => {
  let gd = null;
  beforeAll((done) =>
    initializeGDevelopJs().then((module) => {
      gd = module;
      done();
    })
  );

  describe('can generate a function that create an instance', () => {
    const generateFunctionWithCreateAction = (gd) => {
      const serializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'Create' },
              parameters: ['', 'MyObject', '123', '456', ''],
            },
          ],
          events: [],
        },
      ]);

      return generateCompiledEventsFromSerializedEvents(gd, serializerElement, {
        parameterTypes: { MyObject: 'object' },
        logCode: false,
      });
    };

    // The "objectListOrEmptyIfJustDeclared" parameter type used by the
    // "Create" action try to workaround this issue. It works when the action
    // is in the scene and the 1st of its event, but the "createObject" method
    // from function contexts is not aware of the workaround.
    
    // TODO The created instance should be picked when the object is free.
    it('the object list stays free', function () {
      const runCompiledEvents = generateFunctionWithCreateAction(gd);
      const { gdjs, runtimeScene } = makeMinimalGDJSMock();

      const objectName = 'MyObject';
      const myObjectLists = new gdjs.Hashtable();
      const myObject1 = runtimeScene.createObject(objectName);
      const myObject2 = runtimeScene.createObject(objectName);
      myObjectLists.put(objectName, [myObject1, myObject2]);

      // The object is free (all instances are in the list).
      expect(myObjectLists.get('MyObject').length).toBe(2);

      runCompiledEvents(gdjs, runtimeScene, [myObjectLists]);

      // The object is still free (all instances are in the list).
      expect(myObjectLists.get('MyObject').length).toBe(3);
    });

    it('the created instance is added to the picked instances when the object is not free', function () {
      const runCompiledEvents = generateFunctionWithCreateAction(gd);
      const { gdjs, runtimeScene } = makeMinimalGDJSMock();

      const objectName = 'MyObject';
      const myObjectLists = new gdjs.Hashtable();
      const myObject1 = runtimeScene.createObject(objectName);
      const myObject2 = runtimeScene.createObject(objectName);
      // These objects are not added to the list.
      runtimeScene.createObject(objectName);
      runtimeScene.createObject(objectName);
      runtimeScene.createObject(objectName);
      myObjectLists.put(objectName, [myObject1, myObject2]);

      // The object is not free (2 of 5 instances are picked).
      expect(myObjectLists.get('MyObject').length).toBe(2);

      runCompiledEvents(gdjs, runtimeScene, [myObjectLists]);

      // The new instance has been added to the picked instances.
      expect(myObjectLists.get('MyObject').length).toBe(3);
    });
  });
});
