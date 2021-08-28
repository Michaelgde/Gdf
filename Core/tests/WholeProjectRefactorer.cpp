/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering project refactoring
 */
#include "GDCore/IDE/WholeProjectRefactorer.h"
#include "GDCore/IDE/UnfilledRequiredBehaviorPropertyProblem.h"
#include "DummyPlatform.h"
#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ParameterMetadataTools.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Variable.h"
#include "catch.hpp"

namespace {

gd::StandardEvent &EnsureStandardEvent(gd::BaseEvent &baseEvent) {
  gd::StandardEvent *standardEvent =
      dynamic_cast<gd::StandardEvent *>(&baseEvent);
  INFO("The inspected event is "
       << (standardEvent ? "a standard event" : "not a standard event"));
  REQUIRE(standardEvent != nullptr);

  return *standardEvent;
}

const gd::String &GetEventFirstActionFirstParameterString(
    gd::BaseEvent &event) {
  auto &actions = EnsureStandardEvent(event).GetActions();
  REQUIRE(actions.IsEmpty() == false);
  REQUIRE(actions.Get(0).GetParametersCount() != 0);

  return actions.Get(0).GetParameter(0).GetPlainString();
}

const gd::String &GetEventFirstConditionType(gd::BaseEvent &event) {
  auto &conditions = EnsureStandardEvent(event).GetConditions();
  REQUIRE(conditions.IsEmpty() == false);

  return conditions.Get(0).GetType();
}

const gd::String &GetEventFirstActionType(gd::BaseEvent &event) {
  auto &actions = EnsureStandardEvent(event).GetActions();
  REQUIRE(actions.IsEmpty() == false);

  return actions.Get(0).GetType();
}

gd::EventsFunctionsExtension &SetupProjectWithEventsFunctionExtension(
    gd::Project &project) {
  auto &eventsExtension =
      project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);

  // Add a (free) function and a (free) expression
  eventsExtension.InsertNewEventsFunction("MyEventsFunction", 0);
  eventsExtension.InsertNewEventsFunction("MyEventsFunctionExpression", 1)
      .SetFunctionType(gd::EventsFunction::Expression);

  // Add some usage for them
  {
    auto &layout = project.InsertNewLayout("LayoutWithFreeFunctions", 0);
    auto &externalEvents =
        project.InsertNewExternalEvents("ExternalEventsWithFreeFunctions", 0);
    externalEvents.SetAssociatedLayout("LayoutWithFreeFunctions");

    // Create an event in the layout referring to
    // MyEventsExtension::MyEventsFunction
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType("MyEventsExtension::MyEventsFunction");
      instruction.SetParametersCount(3);
      instruction.SetParameter(0, gd::Expression("First parameter"));
      instruction.SetParameter(1, gd::Expression("Second parameter"));
      instruction.SetParameter(2, gd::Expression("Third parameter"));
      event.GetActions().Insert(instruction);
      layout.GetEvents().InsertEvent(event);
    }

    // Create an event in the external events referring to
    // MyEventsExtension::MyEventsFunctionExpression
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomething");
      instruction.SetParametersCount(1);
      instruction.SetParameter(
          0,
          gd::Expression(
              "1 + MyEventsExtension::MyEventsFunctionExpression(123, 456)"));
      event.GetActions().Insert(instruction);
      externalEvents.GetEvents().InsertEvent(event);
    }
  }

  // Add a events based behavior
  {
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().InsertNew(
            "MyEventsBasedBehavior", 0);
    eventsBasedBehavior.SetFullName("My events based behavior");
    eventsBasedBehavior.SetDescription("An events based behavior for test");

    // Add functions
    auto &behaviorEventsFunctions = eventsBasedBehavior.GetEventsFunctions();
    behaviorEventsFunctions.InsertNewEventsFunction("MyBehaviorEventsFunction",
                                                    0);
    behaviorEventsFunctions
        .InsertNewEventsFunction("MyBehaviorEventsFunctionExpression", 1)
        .SetFunctionType(gd::EventsFunction::Expression);

    // Add property
    eventsBasedBehavior.GetPropertyDescriptors()
        .InsertNew("MyProperty", 0)
        .SetType("Number");
  }

  // Add some usage in events
  {
    auto &layout = project.InsertNewLayout("LayoutWithBehaviorFunctions", 0);
    auto &externalEvents = project.InsertNewExternalEvents(
        "ExternalEventsWithBehaviorFunctions", 0);
    externalEvents.SetAssociatedLayout("LayoutWithBehaviorFunctions");

    auto &object = layout.InsertNewObject(
        project, "MyExtension::Sprite", "ObjectWithMyBehavior", 0);
    object.AddBehavior(gd::BehaviorContent(
        "MyBehavior", "MyEventsExtension::MyEventsBasedBehavior"));

    auto &globalObject = project.InsertNewObject(
        project, "MyExtension::Sprite", "GlobalObjectWithMyBehavior", 0);
    globalObject.AddBehavior(gd::BehaviorContent(
        "MyBehavior", "MyEventsExtension::MyEventsBasedBehavior"));

    // Create an event in the layout referring to
    // MyEventsExtension::MyEventsBasedBehavior::MyBehaviorEventsFunction
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType(
          "MyEventsExtension::MyEventsBasedBehavior::MyBehaviorEventsFunction");
      instruction.SetParametersCount(3);
      instruction.SetParameter(0, gd::Expression("First parameter"));
      instruction.SetParameter(1, gd::Expression("Second parameter"));
      instruction.SetParameter(2, gd::Expression("Third parameter"));
      event.GetActions().Insert(instruction);
      layout.GetEvents().InsertEvent(event);
    }

    // Create an event in the layout using "MyProperty" action
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType(
          "MyEventsExtension::MyEventsBasedBehavior::" +
          gd::EventsBasedBehavior::GetPropertyActionName("MyProperty"));
      event.GetActions().Insert(instruction);
      layout.GetEvents().InsertEvent(event);
    }

    // Create an event in the layout using "MyProperty" condition
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType(
          "MyEventsExtension::MyEventsBasedBehavior::" +
          gd::EventsBasedBehavior::GetPropertyConditionName("MyProperty"));
      event.GetConditions().Insert(instruction);
      layout.GetEvents().InsertEvent(event);
    }

    // Create an event in the layout using "MyProperty" expression
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomething");
      instruction.SetParametersCount(1);
      instruction.SetParameter(
          0,
          gd::Expression(
              "ObjectWithMyBehavior.MyBehavior::" +
              gd::EventsBasedBehavior::GetPropertyExpressionName("MyProperty") +
              "()"));
      event.GetActions().Insert(instruction);
      layout.GetEvents().InsertEvent(event);
    }

    // Create an event in ExternalEvents1 referring to
    // MyEventsExtension::MyEventsBasedBehavior::MyBehaviorEventsFunctionExpression
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomething");
      instruction.SetParametersCount(1);
      instruction.SetParameter(
          0,
          gd::Expression("1 + "
                         "ObjectWithMyBehavior.MyBehavior::"
                         "MyBehaviorEventsFunctionExpression(123, 456, 789)"));
      event.GetActions().Insert(instruction);
      externalEvents.GetEvents().InsertEvent(event);
    }

    // Create an event in ExternalEvents1 **wrongly** referring to
    // MyEventsExtension::MyEventsBasedBehavior::MyBehaviorEventsFunctionExpression
    // (it's ill-named).
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomething");
      instruction.SetParametersCount(1);
      instruction.SetParameter(
          0,
          gd::Expression("2 + "
                         "ObjectWithMyBehavior::MyBehavior."
                         "MyBehaviorEventsFunctionExpression(123, 456, 789)"));
      event.GetActions().Insert(instruction);
      externalEvents.GetEvents().InsertEvent(event);
    }

    // Create an event in ExternalEvents1 referring to
    // MyEventsExtension::MyEventsBasedBehavior::MyBehaviorEventsFunctionExpression
    // function name without calling the function.
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomething");
      instruction.SetParametersCount(1);
      instruction.SetParameter(
          0,
          gd::Expression("3 + "
                         "ObjectWithMyBehavior.MyBehavior::"
                         "MyBehaviorEventsFunctionExpression"));
      event.GetActions().Insert(instruction);
      externalEvents.GetEvents().InsertEvent(event);
    }

    // Create an event in ExternalEvents1 **wrongly** referring to
    // MyEventsExtension::MyEventsBasedBehavior::MyBehaviorEventsFunctionExpression
    // function name without calling the function (it's ill-named).
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomething");
      instruction.SetParametersCount(1);
      instruction.SetParameter(
          0,
          gd::Expression("4 + "
                         "ObjectWithMyBehavior::MyBehavior."
                         "MyBehaviorEventsFunctionExpression"));
      event.GetActions().Insert(instruction);
      externalEvents.GetEvents().InsertEvent(event);
    }
  }

  return eventsExtension;
}
}  // namespace

TEST_CASE("WholeProjectRefactorer", "[common]") {
  SECTION("Object deleted (in layout)") {
    SECTION("Groups") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);
      auto &layout1 = project.InsertNewLayout("Layout1", 0);

      gd::ObjectGroup group1;
      group1.AddObject("Object1");
      group1.AddObject("Object2");
      group1.AddObject("NotExistingObject");
      group1.AddObject("GlobalObject1");
      layout1.GetObjectGroups().Insert(group1);

      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object1", 0);
      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object2", 0);

      gd::WholeProjectRefactorer::ObjectOrGroupRemovedInLayout(
          project, layout1, "Object1", /* isObjectGroup =*/false);
      gd::WholeProjectRefactorer::GlobalObjectOrGroupRemoved(
          project, "GlobalObject1", /* isObjectGroup =*/false);
      REQUIRE(layout1.GetObjectGroups()[0].Find("Object1") == false);
      REQUIRE(layout1.GetObjectGroups()[0].Find("Object2") == true);
      REQUIRE(layout1.GetObjectGroups()[0].Find("NotExistingObject") == true);
      REQUIRE(layout1.GetObjectGroups()[0].Find("GlobalObject1") == false);
    }

    SECTION("Initial instances") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);
      auto &layout1 = project.InsertNewLayout("Layout1", 0);

      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object1", 0);
      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object2", 0);

      gd::InitialInstance instance1;
      instance1.SetObjectName("Object1");
      gd::InitialInstance instance2;
      instance2.SetObjectName("Object2");
      gd::InitialInstance instance3;
      instance3.SetObjectName("GlobalObject1");
      layout1.GetInitialInstances().InsertInitialInstance(instance1);
      layout1.GetInitialInstances().InsertInitialInstance(instance2);
      layout1.GetInitialInstances().InsertInitialInstance(instance3);

      gd::WholeProjectRefactorer::ObjectOrGroupRemovedInLayout(
          project, layout1, "Object1", /* isObjectGroup =*/false);
      gd::WholeProjectRefactorer::GlobalObjectOrGroupRemoved(
          project, "GlobalObject1", /* isObjectGroup =*/false);
      REQUIRE(layout1.GetInitialInstances().HasInstancesOfObject("Object1") ==
              false);
      REQUIRE(layout1.GetInitialInstances().HasInstancesOfObject("Object2") ==
              true);
      REQUIRE(layout1.GetInitialInstances().HasInstancesOfObject(
                  "GlobalObject1") == false);
    }

    SECTION("Initial instances in associated external layouts") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);
      auto &layout1 = project.InsertNewLayout("Layout1", 0);
      auto &layout2 = project.InsertNewLayout("Layout2", 0);
      auto &externalLayout1 =
          project.InsertNewExternalLayout("ExternalLayout1", 0);
      auto &externalLayout2 =
          project.InsertNewExternalLayout("ExternalLayout2", 0);

      externalLayout1.SetAssociatedLayout("Layout1");
      externalLayout2.SetAssociatedLayout("Layout2");

      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object1", 0);
      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object2", 0);

      gd::InitialInstance instance1;
      instance1.SetObjectName("Object1");
      gd::InitialInstance instance2;
      instance2.SetObjectName("Object2");
      gd::InitialInstance instance3;
      instance3.SetObjectName("GlobalObject1");
      externalLayout1.GetInitialInstances().InsertInitialInstance(instance1);
      externalLayout1.GetInitialInstances().InsertInitialInstance(instance2);
      externalLayout1.GetInitialInstances().InsertInitialInstance(instance3);
      externalLayout2.GetInitialInstances().InsertInitialInstance(instance1);
      externalLayout2.GetInitialInstances().InsertInitialInstance(instance2);
      externalLayout2.GetInitialInstances().InsertInitialInstance(instance3);

      gd::WholeProjectRefactorer::ObjectOrGroupRemovedInLayout(
          project, layout1, "Object1", /* isObjectGroup =*/false);
      gd::WholeProjectRefactorer::GlobalObjectOrGroupRemoved(
          project, "GlobalObject1", /* isObjectGroup =*/false);
      REQUIRE(externalLayout1.GetInitialInstances().HasInstancesOfObject(
                  "Object1") == false);
      REQUIRE(externalLayout1.GetInitialInstances().HasInstancesOfObject(
                  "Object2") == true);
      REQUIRE(externalLayout1.GetInitialInstances().HasInstancesOfObject(
                  "GlobalObject1") == false);
      REQUIRE(externalLayout2.GetInitialInstances().HasInstancesOfObject(
                  "Object1") == true);
      REQUIRE(externalLayout2.GetInitialInstances().HasInstancesOfObject(
                  "Object2") == true);
      REQUIRE(externalLayout2.GetInitialInstances().HasInstancesOfObject(
                  "GlobalObject1") == false);
    }
  }

  SECTION("Object renamed (in layout)") {
    SECTION("Groups") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);
      auto &layout1 = project.InsertNewLayout("Layout1", 0);

      gd::ObjectGroup group1;
      group1.AddObject("Object1");
      group1.AddObject("Object2");
      group1.AddObject("NotExistingObject");
      group1.AddObject("GlobalObject1");
      layout1.GetObjectGroups().Insert(group1);

      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object1", 0);
      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object2", 0);

      gd::WholeProjectRefactorer::ObjectOrGroupRenamedInLayout(
          project, layout1, "Object1", "Object3", /* isObjectGroup =*/false);
      gd::WholeProjectRefactorer::GlobalObjectOrGroupRenamed(
          project, "GlobalObject1", "GlobalObject3", /* isObjectGroup =*/false);
      REQUIRE(layout1.GetObjectGroups()[0].Find("Object1") == false);
      REQUIRE(layout1.GetObjectGroups()[0].Find("Object2") == true);
      REQUIRE(layout1.GetObjectGroups()[0].Find("Object3") == true);
      REQUIRE(layout1.GetObjectGroups()[0].Find("GlobalObject1") == false);
      REQUIRE(layout1.GetObjectGroups()[0].Find("GlobalObject3") == true);
    }

    SECTION("Initial instances") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);
      auto &layout1 = project.InsertNewLayout("Layout1", 0);

      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object1", 0);
      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object2", 0);

      gd::InitialInstance instance1;
      instance1.SetObjectName("Object1");
      gd::InitialInstance instance2;
      instance2.SetObjectName("Object2");
      gd::InitialInstance instance3;
      instance3.SetObjectName("GlobalObject1");
      layout1.GetInitialInstances().InsertInitialInstance(instance1);
      layout1.GetInitialInstances().InsertInitialInstance(instance2);
      layout1.GetInitialInstances().InsertInitialInstance(instance3);

      gd::WholeProjectRefactorer::ObjectOrGroupRenamedInLayout(
          project, layout1, "Object1", "Object3", /* isObjectGroup =*/false);
      gd::WholeProjectRefactorer::GlobalObjectOrGroupRenamed(
          project, "GlobalObject1", "GlobalObject3", /* isObjectGroup =*/false);
      REQUIRE(layout1.GetInitialInstances().HasInstancesOfObject("Object1") ==
              false);
      REQUIRE(layout1.GetInitialInstances().HasInstancesOfObject("Object3") ==
              true);
      REQUIRE(layout1.GetInitialInstances().HasInstancesOfObject(
                  "GlobalObject1") == false);
      REQUIRE(layout1.GetInitialInstances().HasInstancesOfObject(
                  "GlobalObject3") == true);
    }

    SECTION("Initial instances in associated external layouts") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);
      auto &layout1 = project.InsertNewLayout("Layout1", 0);
      auto &layout2 = project.InsertNewLayout("Layout2", 0);
      auto &externalLayout1 =
          project.InsertNewExternalLayout("ExternalLayout1", 0);
      auto &externalLayout2 =
          project.InsertNewExternalLayout("ExternalLayout2", 0);

      externalLayout1.SetAssociatedLayout("Layout1");
      externalLayout2.SetAssociatedLayout("Layout2");

      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object1", 0);
      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object2", 0);

      gd::InitialInstance instance1;
      instance1.SetObjectName("Object1");
      gd::InitialInstance instance2;
      instance2.SetObjectName("Object2");
      gd::InitialInstance instance3;
      instance3.SetObjectName("GlobalObject1");
      externalLayout1.GetInitialInstances().InsertInitialInstance(instance1);
      externalLayout1.GetInitialInstances().InsertInitialInstance(instance2);
      externalLayout1.GetInitialInstances().InsertInitialInstance(instance3);
      externalLayout2.GetInitialInstances().InsertInitialInstance(instance1);
      externalLayout2.GetInitialInstances().InsertInitialInstance(instance2);
      externalLayout2.GetInitialInstances().InsertInitialInstance(instance3);

      gd::WholeProjectRefactorer::ObjectOrGroupRenamedInLayout(
          project, layout1, "Object1", "Object3", /* isObjectGroup =*/false);
      gd::WholeProjectRefactorer::GlobalObjectOrGroupRenamed(
          project, "GlobalObject1", "GlobalObject3", /* isObjectGroup =*/false);
      REQUIRE(externalLayout1.GetInitialInstances().HasInstancesOfObject(
                  "Object1") == false);
      REQUIRE(externalLayout1.GetInitialInstances().HasInstancesOfObject(
                  "Object2") == true);
      REQUIRE(externalLayout1.GetInitialInstances().HasInstancesOfObject(
                  "Object3") == true);
      REQUIRE(externalLayout1.GetInitialInstances().HasInstancesOfObject(
                  "GlobalObject1") == false);
      REQUIRE(externalLayout1.GetInitialInstances().HasInstancesOfObject(
                  "GlobalObject3") == true);
      REQUIRE(externalLayout2.GetInitialInstances().HasInstancesOfObject(
                  "Object1") == true);
      REQUIRE(externalLayout2.GetInitialInstances().HasInstancesOfObject(
                  "Object2") == true);
      REQUIRE(externalLayout2.GetInitialInstances().HasInstancesOfObject(
                  "Object3") == false);
      REQUIRE(externalLayout2.GetInitialInstances().HasInstancesOfObject(
                  "GlobalObject1") == false);
      REQUIRE(externalLayout2.GetInitialInstances().HasInstancesOfObject(
                  "GlobalObject3") == true);
    }
  }

  SECTION("Object renamed (in events function)") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);

    // Add a (free) function with an object group
    gd::EventsFunction &eventsFunction =
        eventsExtension.InsertNewEventsFunction("MyEventsFunction", 0);
    gd::ObjectGroup &objectGroup =
        eventsFunction.GetObjectGroups().InsertNew("MyGroup", 0);
    objectGroup.AddObject("Object1");
    objectGroup.AddObject("Object2");
    // In theory, we would add the object parameters, but we're not testing
    // events in this test.

    // Create the objects container for the events function
    gd::ObjectsContainer globalObjectsContainer;
    gd::ObjectsContainer objectsContainer;
    gd::ParameterMetadataTools::ParametersToObjectsContainer(
        project, eventsFunction.GetParameters(), objectsContainer);
    // (this is strictly not necessary because we're not testing events in this
    // test)

    // Trigger the refactoring after the renaming of an object
    gd::WholeProjectRefactorer::ObjectOrGroupRenamedInEventsFunction(
        project,
        eventsFunction,
        globalObjectsContainer,
        objectsContainer,
        "Object1",
        "RenamedObject1",
        /* isObjectGroup=*/false);

    REQUIRE(objectGroup.Find("Object1") == false);
    REQUIRE(objectGroup.Find("RenamedObject1") == true);
    REQUIRE(objectGroup.Find("Object2") == true);

    // Events are not tested
  }

  SECTION("Object deleted (in events function)") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);

    // Add a (free) function with an object group
    gd::EventsFunction &eventsFunction =
        eventsExtension.InsertNewEventsFunction("MyEventsFunction", 0);
    gd::ObjectGroup &objectGroup =
        eventsFunction.GetObjectGroups().InsertNew("MyGroup", 0);
    objectGroup.AddObject("Object1");
    objectGroup.AddObject("Object2");
    // In theory, we would add the object parameters, but we're not testing
    // events in this test.

    // Create the objects container for the events function
    gd::ObjectsContainer globalObjectsContainer;
    gd::ObjectsContainer objectsContainer;
    gd::ParameterMetadataTools::ParametersToObjectsContainer(
        project, eventsFunction.GetParameters(), objectsContainer);
    // (this is strictly not necessary because we're not testing events in this
    // test)

    // Trigger the refactoring after the renaming of an object
    gd::WholeProjectRefactorer::ObjectOrGroupRemovedInEventsFunction(
        project,
        eventsFunction,
        globalObjectsContainer,
        objectsContainer,
        "Object1",
        /* isObjectGroup=*/false);

    REQUIRE(objectGroup.Find("Object1") == false);
    REQUIRE(objectGroup.Find("Object2") == true);

    // Events are not tested
  }

  SECTION("Events extension renamed") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);

    gd::WholeProjectRefactorer::RenameEventsFunctionsExtension(
        project, eventsExtension, "MyEventsExtension", "MyRenamedExtension");

    // Check that events function calls in instructions have been renamed
    REQUIRE(GetEventFirstActionType(project.GetLayout("LayoutWithFreeFunctions")
                                        .GetEvents()
                                        .GetEvent(0)) ==
            "MyRenamedExtension::MyEventsFunction");

    // Check that events function calls in expressions have been renamed
    REQUIRE(GetEventFirstActionFirstParameterString(
                project.GetExternalEvents("ExternalEventsWithFreeFunctions")
                    .GetEvents()
                    .GetEvent(0)) ==
            "1 + MyRenamedExtension::MyEventsFunctionExpression(123, 456)");

    // Check that the type of the behavior was changed in the behaviors of
    // objects. Name is *not* changed.
    REQUIRE(project.GetLayout("LayoutWithBehaviorFunctions")
                .GetObject("ObjectWithMyBehavior")
                .GetBehavior("MyBehavior")
                .GetTypeName() == "MyRenamedExtension::MyEventsBasedBehavior");
    REQUIRE(project.GetObject("GlobalObjectWithMyBehavior")
                .GetBehavior("MyBehavior")
                .GetTypeName() == "MyRenamedExtension::MyEventsBasedBehavior");

    // Check if events-based behavior methods have been renamed in
    // instructions
    REQUIRE(
        GetEventFirstActionType(project.GetLayout("LayoutWithBehaviorFunctions")
                                    .GetEvents()
                                    .GetEvent(0)) ==
        "MyRenamedExtension::MyEventsBasedBehavior::"
        "MyBehaviorEventsFunction");

    // Check if events-based behaviors properties have been renamed in
    // instructions
    REQUIRE(
        GetEventFirstActionType(project.GetLayout("LayoutWithBehaviorFunctions")
                                    .GetEvents()
                                    .GetEvent(1)) ==
        "MyRenamedExtension::MyEventsBasedBehavior::"
        "SetPropertyMyProperty");

    // Check events-based behavior methods have *not* been renamed in
    // expressions
    REQUIRE(GetEventFirstActionFirstParameterString(
                project.GetExternalEvents("ExternalEventsWithBehaviorFunctions")
                    .GetEvents()
                    .GetEvent(0)) ==
            "1 + "
            "ObjectWithMyBehavior.MyBehavior::"
            "MyBehaviorEventsFunctionExpression(123, 456, 789)");

    REQUIRE(GetEventFirstActionFirstParameterString(
                project.GetExternalEvents("ExternalEventsWithBehaviorFunctions")
                    .GetEvents()
                    .GetEvent(2)) ==
            "3 + "
            "ObjectWithMyBehavior.MyBehavior::"
            "MyBehaviorEventsFunctionExpression");
  }
  SECTION("(Free) events function renamed") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);

    gd::WholeProjectRefactorer::RenameEventsFunction(project,
                                                     eventsExtension,
                                                     "MyEventsFunction",
                                                     "MyRenamedEventsFunction");
    gd::WholeProjectRefactorer::RenameEventsFunction(
        project,
        eventsExtension,
        "MyEventsFunctionExpression",
        "MyRenamedFunctionExpression");

    // Check that events function calls in instructions have been renamed
    REQUIRE(GetEventFirstActionType(project.GetLayout("LayoutWithFreeFunctions")
                                        .GetEvents()
                                        .GetEvent(0)) ==
            "MyEventsExtension::MyRenamedEventsFunction");

    // Check that events function calls in expressions have been renamed
    REQUIRE(GetEventFirstActionFirstParameterString(
                project.GetExternalEvents("ExternalEventsWithFreeFunctions")
                    .GetEvents()
                    .GetEvent(0)) ==
            "1 + MyEventsExtension::MyRenamedFunctionExpression(123, 456)");
  }
  SECTION("(Free) events function parameter moved") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);

    gd::WholeProjectRefactorer::MoveEventsFunctionParameter(
        project, eventsExtension, "MyEventsFunction", 0, 2);
    gd::WholeProjectRefactorer::MoveEventsFunctionParameter(
        project, eventsExtension, "MyEventsFunctionExpression", 0, 1);

    // Check that events function calls in instructions have been updated
    auto &action = static_cast<gd::StandardEvent &>(
                       project.GetLayout("LayoutWithFreeFunctions")
                           .GetEvents()
                           .GetEvent(0))
                       .GetActions()
                       .Get(0);
    REQUIRE(action.GetParameter(0).GetPlainString() == "Second parameter");
    REQUIRE(action.GetParameter(1).GetPlainString() == "Third parameter");
    REQUIRE(action.GetParameter(2).GetPlainString() == "First parameter");

    // Check that events function calls in expressions have been updated
    REQUIRE(GetEventFirstActionFirstParameterString(
                project.GetExternalEvents("ExternalEventsWithFreeFunctions")
                    .GetEvents()
                    .GetEvent(0)) ==
            "1 + MyEventsExtension::MyEventsFunctionExpression(456, 123)");
  }
  SECTION("Events based Behavior type renamed") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().Get("MyEventsBasedBehavior");

    gd::WholeProjectRefactorer::RenameEventsBasedBehavior(
        project,
        eventsExtension,
        "MyEventsBasedBehavior",
        "MyRenamedEventsBasedBehavior");

    // Check that the type of the behavior was changed in the behaviors of
    // objects. Name is *not* changed.
    REQUIRE(project.GetLayout("LayoutWithBehaviorFunctions")
                .GetObject("ObjectWithMyBehavior")
                .GetBehavior("MyBehavior")
                .GetTypeName() ==
            "MyEventsExtension::MyRenamedEventsBasedBehavior");
    REQUIRE(project.GetObject("GlobalObjectWithMyBehavior")
                .GetBehavior("MyBehavior")
                .GetTypeName() ==
            "MyEventsExtension::MyRenamedEventsBasedBehavior");

    // Check if events-based behavior methods have been renamed in
    // instructions
    REQUIRE(
        GetEventFirstActionType(project.GetLayout("LayoutWithBehaviorFunctions")
                                    .GetEvents()
                                    .GetEvent(0)) ==
        "MyEventsExtension::MyRenamedEventsBasedBehavior::"
        "MyBehaviorEventsFunction");

    // Check if events-based behaviors properties have been renamed in
    // instructions
    REQUIRE(
        GetEventFirstActionType(project.GetLayout("LayoutWithBehaviorFunctions")
                                    .GetEvents()
                                    .GetEvent(1)) ==
        "MyEventsExtension::MyRenamedEventsBasedBehavior::"
        "SetPropertyMyProperty");

    // Check events-based behavior methods have *not* been renamed in
    // expressions
    REQUIRE(GetEventFirstActionFirstParameterString(
                project.GetExternalEvents("ExternalEventsWithBehaviorFunctions")
                    .GetEvents()
                    .GetEvent(0)) ==
            "1 + "
            "ObjectWithMyBehavior.MyBehavior::"
            "MyBehaviorEventsFunctionExpression(123, 456, 789)");
  }
  SECTION("(Events based Behavior) events function renamed") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().Get("MyEventsBasedBehavior");

    gd::WholeProjectRefactorer::RenameBehaviorEventsFunction(
        project,
        eventsExtension,
        eventsBasedBehavior,
        "MyBehaviorEventsFunction",
        "MyRenamedBehaviorEventsFunction");
    gd::WholeProjectRefactorer::RenameBehaviorEventsFunction(
        project,
        eventsExtension,
        eventsBasedBehavior,
        "MyBehaviorEventsFunctionExpression",
        "MyRenamedBehaviorEventsFunctionExpression");

    // Check if events-based behavior methods have been renamed in
    // instructions
    REQUIRE(
        GetEventFirstActionType(project.GetLayout("LayoutWithBehaviorFunctions")
                                    .GetEvents()
                                    .GetEvent(0)) ==
        "MyEventsExtension::MyEventsBasedBehavior::"
        "MyRenamedBehaviorEventsFunction");

    // Check events-based behavior methods have been renamed in
    // expressions
    REQUIRE(GetEventFirstActionFirstParameterString(
                project.GetExternalEvents("ExternalEventsWithBehaviorFunctions")
                    .GetEvents()
                    .GetEvent(0)) ==
            "1 + "
            "ObjectWithMyBehavior.MyBehavior::"
            "MyRenamedBehaviorEventsFunctionExpression(123, 456, 789)");

    // Check that a ill-named function that looks a bit like a behavior method
    // (but which is actually an object function) is *not* renamed.
    REQUIRE(GetEventFirstActionFirstParameterString(
                project.GetExternalEvents("ExternalEventsWithBehaviorFunctions")
                    .GetEvents()
                    .GetEvent(1)) ==
            "2 + "
            "ObjectWithMyBehavior::MyBehavior."
            "MyBehaviorEventsFunctionExpression(123, 456, 789)");

    // Check events based behaviors functions have been renamed in
    // expressions referring to the function with just its name
    REQUIRE(GetEventFirstActionFirstParameterString(
                project.GetExternalEvents("ExternalEventsWithBehaviorFunctions")
                    .GetEvents()
                    .GetEvent(2)) ==
            "3 + "
            "ObjectWithMyBehavior.MyBehavior::"
            "MyRenamedBehaviorEventsFunctionExpression");

    // Check that a ill-named function that looks a bit like a behavior method
    // (but which is actually an object function) is *not* renamed.
    REQUIRE(GetEventFirstActionFirstParameterString(
                project.GetExternalEvents("ExternalEventsWithBehaviorFunctions")
                    .GetEvents()
                    .GetEvent(3)) ==
            "4 + "
            "ObjectWithMyBehavior::MyBehavior."
            "MyBehaviorEventsFunctionExpression");
  }
  SECTION("(Events based Behavior) events function parameter moved") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().Get("MyEventsBasedBehavior");

    gd::WholeProjectRefactorer::MoveBehaviorEventsFunctionParameter(
        project,
        eventsExtension,
        eventsBasedBehavior,
        "MyBehaviorEventsFunction",
        0,
        2);
    gd::WholeProjectRefactorer::MoveBehaviorEventsFunctionParameter(
        project,
        eventsExtension,
        eventsBasedBehavior,
        "MyBehaviorEventsFunctionExpression",
        0,
        2);

    // Check if parameters of events-based behavior methods have been moved in
    // instructions
    auto &action = static_cast<gd::StandardEvent &>(
                       project.GetLayout("LayoutWithBehaviorFunctions")
                           .GetEvents()
                           .GetEvent(0))
                       .GetActions()
                       .Get(0);
    REQUIRE(action.GetParameter(0).GetPlainString() == "Second parameter");
    REQUIRE(action.GetParameter(1).GetPlainString() == "Third parameter");
    REQUIRE(action.GetParameter(2).GetPlainString() == "First parameter");

    // Check parameters of events-based behavior methods have been moved in
    // expressions
    REQUIRE(GetEventFirstActionFirstParameterString(
                project.GetExternalEvents("ExternalEventsWithBehaviorFunctions")
                    .GetEvents()
                    .GetEvent(0)) ==
            "1 + "
            "ObjectWithMyBehavior.MyBehavior::"
            "MyBehaviorEventsFunctionExpression(456, 789, 123)");

    // Check that a ill-named function that looks a bit like a behavior method
    // (but which is actually a free function) has its parameter *not* moved.
    REQUIRE(GetEventFirstActionFirstParameterString(
                project.GetExternalEvents("ExternalEventsWithBehaviorFunctions")
                    .GetEvents()
                    .GetEvent(1)) ==
            "2 + "
            "ObjectWithMyBehavior::MyBehavior."
            "MyBehaviorEventsFunctionExpression(123, 456, 789)");
  }
  SECTION("(Events based Behavior) property renamed") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().Get("MyEventsBasedBehavior");

    gd::WholeProjectRefactorer::RenameBehaviorProperty(project,
                                                       eventsExtension,
                                                       eventsBasedBehavior,
                                                       "MyProperty",
                                                       "MyRenamedProperty");

    // Check if events-based behaviors property has been renamed in
    // instructions
    REQUIRE(
        GetEventFirstActionType(project.GetLayout("LayoutWithBehaviorFunctions")
                                    .GetEvents()
                                    .GetEvent(1)) ==
        "MyEventsExtension::MyEventsBasedBehavior::"
        "SetPropertyMyRenamedProperty");

    REQUIRE(GetEventFirstConditionType(
                project.GetLayout("LayoutWithBehaviorFunctions")
                    .GetEvents()
                    .GetEvent(2)) ==
            "MyEventsExtension::MyEventsBasedBehavior::"
            "PropertyMyRenamedProperty");

    REQUIRE(GetEventFirstActionFirstParameterString(
                project.GetLayout("LayoutWithBehaviorFunctions")
                    .GetEvents()
                    .GetEvent(3)) ==
            "ObjectWithMyBehavior.MyBehavior::PropertyMyRenamedProperty()");
  }
  SECTION("(Events based Behavior) no required behavior") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().Get("MyEventsBasedBehavior");

    std::vector<gd::UnfilledRequiredBehaviorPropertyProblem> problems =
            gd::WholeProjectRefactorer::FindInvalidRequiredBehaviorProperties(
                    project);
    REQUIRE(problems.size() == 0);
  }
  SECTION("(Events based Behavior) unfilled required behavior") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().Get("MyEventsBasedBehavior");

    // Add a required behavior
    eventsBasedBehavior.GetPropertyDescriptors()
        .InsertNew("RequiredBehaviorProperty", 0)
        .SetType("Behavior").GetExtraInfo().push_back("PlatformBehavior::PlatformBehavior");

    std::vector<gd::UnfilledRequiredBehaviorPropertyProblem> problems =
            gd::WholeProjectRefactorer::FindInvalidRequiredBehaviorProperties(
                    project);
    REQUIRE(problems.size() == 1);
    REQUIRE(problems[0].GetSourceObject().GetName() == "ObjectWithMyBehavior");
    REQUIRE(problems[0].GetSourceBehaviorContent().GetName() == "MyEventsBasedBehavior");
    REQUIRE(problems[0].GetSourcePropertyName() == "RequiredBehaviorProperty");
    REQUIRE(problems[0].GetExpectedBehaviorTypeName() == "PlatformBehavior::PlatformBehavior");
  }
  SECTION("(Events based Behavior) filled required behavior") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().Get("MyEventsBasedBehavior");

    // Add a required behavior property
    eventsBasedBehavior.GetPropertyDescriptors()
        .InsertNew("RequiredBehaviorProperty", 0)
        .SetType("Behavior").GetExtraInfo().push_back("PlatformBehavior::PlatformBehavior");

    // Add the required behavior on the object
    auto &object = project.GetLayout("LayoutWithBehaviorFunctions")
            .GetObject("ObjectWithMyBehavior");
    object.AddBehavior(gd::BehaviorContent(
        "PlatformBehavior", "PlatformBehavior::PlatformBehavior"));

    // Fill the required behavior property on the object
    gd::Behavior& behavior = gd::MetadataProvider::GetBehaviorMetadata(
        platform,
        "MyEventsExtension::MyEventsBasedBehavior").Get();
    gd::BehaviorContent& behaviorContent = object.GetBehavior("MyEventsBasedBehavior");
        behavior.UpdateProperty(
            behaviorContent.GetContent(),
            "RequiredBehaviorProperty",
            "PlatformBehavior");

    std::vector<gd::UnfilledRequiredBehaviorPropertyProblem> problems =
            gd::WholeProjectRefactorer::FindInvalidRequiredBehaviorProperties(
                    project);
    REQUIRE(problems.size() == 0);
  }
  SECTION("(Events based Behavior) wrongly filled required behavior") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().Get("MyEventsBasedBehavior");

    // Add a required behavior property
    eventsBasedBehavior.GetPropertyDescriptors()
        .InsertNew("RequiredBehaviorProperty", 0)
        .SetType("Behavior").GetExtraInfo().push_back("PlatformBehavior::PlatformBehavior");

    // Add the required behavior on the object
    auto &object = project.GetLayout("LayoutWithBehaviorFunctions")
            .GetObject("ObjectWithMyBehavior");
    object.AddBehavior(gd::BehaviorContent(
        "PlatformBehavior", "PlatformBehavior::PlatformBehavior"));

    // Fill the required behavior property on the object with the wrong behavior name
    gd::Behavior& behavior = gd::MetadataProvider::GetBehaviorMetadata(
        platform,
        "MyEventsExtension::MyEventsBasedBehavior").Get();
    gd::BehaviorContent& behaviorContent = object.GetBehavior("MyEventsBasedBehavior");
        behavior.UpdateProperty(
            behaviorContent.GetContent(),
            "RequiredBehaviorProperty",
            "MyEventsBasedBehavior");

    std::vector<gd::UnfilledRequiredBehaviorPropertyProblem> problems =
            gd::WholeProjectRefactorer::FindInvalidRequiredBehaviorProperties(
                    project);
    REQUIRE(problems.size() == 0);
  }
  SECTION("(Events based Behavior) add behavior and required behaviors on an object") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().Get("MyEventsBasedBehavior");

    // Add a 2nd behavior on the object
    auto &eventsBasedBehaviorB =
        eventsExtension.GetEventsBasedBehaviors().InsertNew(
            "MyEventsBasedBehaviorB", 0);
    eventsBasedBehaviorB.SetFullName("My events based behavior B");
    eventsBasedBehaviorB.SetDescription("An events based behavior for test B");

    // Make the 1st behavior requires it
    eventsBasedBehavior.GetPropertyDescriptors()
        .InsertNew("RequiredBehaviorProperty", 0)
        .SetType("Behavior").GetExtraInfo().push_back("MyEventsExtension::MyEventsBasedBehaviorB");

    // Make the 2nd behavior require a Platformer
    eventsBasedBehaviorB.GetPropertyDescriptors()
        .InsertNew("RequiredBehaviorProperty", 0)
        .SetType("Behavior").GetExtraInfo().push_back("PlatformBehavior::PlatformBehavior");

    // Remove the behavior from the object
    object.RemoveBehavior(gd::BehaviorContent("MyBehavior"));

    // Add it back
    gd::WholeProjectRefactorer::AddBehaviorAndRequiredBehaviors(
        project,
        object,
        "behaviorType",
        "behaviorName");
    
    // Required behavior are added transitively 
    REQUIRE(object.hasBehaviorNamed("MyBehavior"));
    REQUIRE(object.hasBehaviorNamed("MyBehaviorB"));
    REQUIRE(object.hasBehaviorNamed("PlatformBehavior"));
    
    std::map<gd::String, gd::PropertyDescriptor>& behaviorProperties = ;
        gd::MetadataProvider::GetBehaviorMetadata(
            platform,
            "MyEventsExtension::MyEventsBasedBehavior").Get()
                .GetProperties(object.GetBehavior("MyEventsBasedBehavior").Get());
    std::map<gd::String, gd::PropertyDescriptor>& behaviorBProperties = ;
        gd::MetadataProvider::GetBehaviorMetadata(
            platform,
            "MyEventsExtension::MyEventsBasedBehaviorB").Get()
                .GetProperties(object.GetBehavior("MyEventsBasedBehaviorB").Get());
    
    REQUIRE(behaviorProperties.at("RequiredBehaviorProperty") == "MyEventsBasedBehaviorB");
    REQUIRE(behaviorBProperties.at("RequiredBehaviorProperty") == "PlatformBehavior");
  }
}


  static void AddBehaviorAndRequiredBehaviors(
    gd::Project& project,
    gd::Object& object,
    const gd::String& behaviorType,
    const gd::String& behaviorName);