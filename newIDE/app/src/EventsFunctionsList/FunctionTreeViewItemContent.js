// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import newNameGenerator from '../Utils/NewNameGenerator';
import Clipboard, { SafeExtractor } from '../Utils/Clipboard';
import Window from '../Utils/Window';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';

const gd: libGDevelop = global.gd;

const EVENTS_FUNCTION_CLIPBOARD_KIND = 'Events Function';

export class FunctionTreeViewItemContent implements TreeViewItemContent {
  eventFunction: gdEventsFunction;
  props: EventFunctionProps;

  constructor(eventFunction: gdEventsFunction, props: EventFunctionProps) {
    this.eventFunction = eventFunction;
    this.props = props;
  }

  getName(): string | React.Node {
    return this.eventFunction.getName();
  }
  getId(): string {
    const behavior = this.props.eventsBasedBehavior;
    const object = this.props.eventsBasedObject;
    return (
      (behavior
        ? `behaviors.${behavior.getName()}.`
        : object
        ? `objects.${object.getName()}.`
        : '') + this.eventFunction.getName()
    );
  }
  getHtmlId(index: number): ?string {
    return `function-item-${index}`;
  }
  getThumbnail(): ?string {
    switch (this.eventFunction.getFunctionType()) {
      default:
        return 'res/functions/function.svg';
      case gd.EventsFunction.Action:
      case gd.EventsFunction.ActionWithOperator:
        switch (this.eventFunction.getName()) {
          default:
            return 'res/functions/action.svg';

          case 'onSceneUnloading':
          case 'onDestroy':
            return 'res/functions/destroy.svg';

          case 'onSceneResumed':
          case 'onActivate':
            return 'res/functions/activate.svg';

          case 'onScenePaused':
          case 'onDeActivate':
            return 'res/functions/deactivate.svg';

          case 'onScenePreEvents':
          case 'onScenePostEvents':
          case 'doStepPreEvents':
          case 'doStepPostEvents':
            return 'res/functions/step.svg';

          case 'onSceneLoaded':
          case 'onFirstSceneLoaded':
          case 'onCreated':
            return 'res/functions/create.svg';

          case 'onHotReloading':
            return 'res/functions/reload.svg';
        }
      case gd.EventsFunction.Condition:
        return 'res/functions/condition.svg';
      case gd.EventsFunction.Expression:
      case gd.EventsFunction.ExpressionAndCondition:
        return 'res/functions/expression.svg';
    }
  }
  getDataset(): ?HTMLDataset {
    return null;
  }
  onSelect(): void {
    this.props.onSelectEventsFunction(
      this.eventFunction,
      this.props.eventsBasedBehavior,
      this.props.eventsBasedObject
    );
  }
  buildMenuTemplate(i18n: I18nType, index: number) {
    const eventsFunction = this.eventFunction;
    return [
      {
        label: i18n._(t`Rename`),
        click: () => this._editName(eventsFunction),
        enabled: this.props.canRename(eventsFunction),
      },
      {
        label: eventsFunction.isPrivate()
          ? i18n._(t`Make public`)
          : i18n._(t`Make private`),
        click: () => this._togglePrivate(eventsFunction),
      },
      {
        label: eventsFunction.isAsync()
          ? i18n._(t`Make synchronous`)
          : i18n._(t`Make asynchronous`),
        click: () => this._toggleAsync(eventsFunction),
      },
      {
        label: i18n._(t`Delete`),
        click: () =>
          this._deleteEventsFunction(eventsFunction, {
            askForConfirmation: true,
          }),
      },
      {
        type: 'separator',
      },
      {
        label: i18n._(t`Copy`),
        click: () => this._copyEventsFunction(eventsFunction),
      },
      {
        label: i18n._(t`Cut`),
        click: () => this._cutEventsFunction(eventsFunction),
      },
      {
        label: i18n._(t`Paste`),
        enabled: Clipboard.has(EVENTS_FUNCTION_CLIPBOARD_KIND),
        click: () => this._pasteEventsFunction(index + 1),
      },
      {
        label: i18n._(t`Duplicate`),
        click: () => this._duplicateEventsFunction(eventsFunction, index + 1),
      },
    ];
  }

  _togglePrivate = (eventsFunction: gdEventsFunction) => {
    eventsFunction.setPrivate(!eventsFunction.isPrivate());
    this.props.forceUpdate();
  };

  _toggleAsync = (eventsFunction: gdEventsFunction) => {
    eventsFunction.setAsync(!eventsFunction.isAsync());
    this.props.forceUpdateList();
  };

  _deleteEventsFunction = (
    eventsFunction: gdEventsFunction,
    { askForConfirmation }: {| askForConfirmation: boolean |}
  ) => {
    const { eventsFunctionsContainer } = this.props;

    if (askForConfirmation) {
      const answer = Window.showConfirmDialog(
        "Are you sure you want to remove this function? This can't be undone."
      );
      if (!answer) return;
    }

    this.props.onDeleteEventsFunction(eventsFunction, doRemove => {
      if (!doRemove) return;

      eventsFunctionsContainer.removeEventsFunction(eventsFunction.getName());
      this._onEventsFunctionModified();
    });
  };

  _editName = (eventsFunction: ?gdEventsFunction) => {
    this.setState(
      {
        renamedEventsFunction: eventsFunction,
      },
      () => {
        if (this.sortableList) this.sortableList.forceUpdateGrid();
      }
    );
  };

  _rename = (eventsFunction: gdEventsFunction, newName: string) => {
    this.setState({
      renamedEventsFunction: null,
    });

    if (eventsFunction.getName() === newName) return;

    this.props.onRenameEventsFunction(eventsFunction, newName, doRename => {
      if (!doRename) return;
      this._onEventsFunctionModified();
    });
  };

  _copyEventsFunction = (eventsFunction: gdEventsFunction) => {
    Clipboard.set(EVENTS_FUNCTION_CLIPBOARD_KIND, {
      eventsFunction: serializeToJSObject(eventsFunction),
      name: eventsFunction.getName(),
    });
  };

  _cutEventsFunction = (eventsFunction: gdEventsFunction) => {
    this._copyEventsFunction(eventsFunction);
    this._deleteEventsFunction(eventsFunction, { askForConfirmation: false });
  };

  _pasteEventsFunction = (index: number) => {
    if (!Clipboard.has(EVENTS_FUNCTION_CLIPBOARD_KIND)) return;

    const clipboardContent = Clipboard.get(EVENTS_FUNCTION_CLIPBOARD_KIND);
    const copiedEventsFunction = SafeExtractor.extractObjectProperty(
      clipboardContent,
      'eventsFunction'
    );
    const name = SafeExtractor.extractStringProperty(clipboardContent, 'name');
    if (!name || !copiedEventsFunction) return;

    const { project, eventsFunctionsContainer } = this.props;

    const newName = newNameGenerator(name, name =>
      eventsFunctionsContainer.hasEventsFunctionNamed(name)
    );

    const newEventsFunction = eventsFunctionsContainer.insertNewEventsFunction(
      newName,
      index
    );

    unserializeFromJSObject(
      newEventsFunction,
      copiedEventsFunction,
      'unserializeFrom',
      project
    );
    newEventsFunction.setName(newName);
    this.props.onEventsFunctionAdded(newEventsFunction);

    this._onEventsFunctionModified();
    this.props.onSelectEventsFunction(newEventsFunction);
    this._editName(newEventsFunction);
  };

  _duplicateEventsFunction = (
    eventsFunction: gdEventsFunction,
    newFunctionIndex: number
  ) => {
    const { eventsFunctionsContainer } = this.props;
    const newName = newNameGenerator(eventsFunction.getName(), name =>
      eventsFunctionsContainer.hasEventsFunctionNamed(name)
    );
    const newEventsFunction = eventsFunctionsContainer.insertEventsFunction(
      eventsFunction,
      newFunctionIndex
    );
    newEventsFunction.setName(newName);
    this.props.onEventsFunctionAdded(newEventsFunction);

    this._onEventsFunctionModified();
    this.props.onSelectEventsFunction(newEventsFunction);
    this._editName(newEventsFunction);
  };
}
