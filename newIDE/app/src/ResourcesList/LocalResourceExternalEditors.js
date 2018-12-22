// @flow
import { openPiskel } from './LocalPiskelBridge';
import { openJfxr } from './LocalJfxrBridge';
import { type ResourceExternalEditor } from './ResourceExternalEditor.flow';
import { sendExternalEditorOpened } from '../Utils/Analytics/EventSender';

/**
 * This is the list of editors that can be used to edit resources
 * on Electron runtime.
 */
const editors: Array<ResourceExternalEditor> = [
  {
    name: 'piskel-app',
    displayName: 'Edit with Piskel',
    kind: 'image',
    edit: options => {
      sendExternalEditorOpened('piskel');
      return openPiskel(options);
    },
  },
  {
    name: 'Jfxr',
    displayName: 'Create/Edit a Sound effect with Jfxr (*.wav)',
    kind: 'audio',
    edit: options => {
      sendExternalEditorOpened('jfxr');
      return openJfxr(options);
    },
  },
];

export default editors;
