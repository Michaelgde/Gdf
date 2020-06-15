// @flow
import * as React from 'react';
import { type Command } from './CommandManager';
import CommandsContext from './CommandsContext';

export const useCommand = (commandName: string, command: Command) => {
  const commandManager = React.useContext(CommandsContext);
  React.useEffect(
    () => {
      if (!command.enabled) return;
      commandManager.registerCommand(commandName, command);
      return () => commandManager.deregisterCommand(commandName);
    },
    // eslint-disable-next-line
    [commandManager, commandName, command.enabled, command.handler]
  );
};

export const useKeyboardShortcutForPalette = (onOpen: () => void) => {
  React.useEffect(
    () => {
      const handler = (e: KeyboardEvent) => {
        const body = document.body;
        const activeEl = document.activeElement;
        const mainFrame = document.querySelector('div.main-frame');
        const isBody = activeEl === body;
        const isInMainframe = mainFrame && mainFrame.contains(activeEl);
        if (!isBody && !isInMainframe) return;
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.code === 'KeyP')
          onOpen();
      };
      document.addEventListener('keyup', handler);
      return () => document.removeEventListener('keyup', handler);
    },
    [onOpen]
  );
};
