import { createPathEditorHeader, fileExists } from '../utils/path-editor.js';

const electron = require('electron');
const electronWindow = electron.remote.getCurrentWindow();
const ipcRenderer = electron.ipcRenderer;
const fs = require('fs');
const remote = electron.remote;

let yarn = null;
let receivedData;

const saveAndCloseCustomPath = pathEditor => {
  const savePath = pathEditor.state.fullPath;
  yarn.data.saveTo(savePath, yarn.data.getSaveData('json'), () => {
    ipcRenderer.send('yarn-changes-saved', savePath, receivedData);
    remote.getCurrentWindow().close();
  });
};

const saveAndClose = () => {
  const savePath = receivedData.resourcePath;
  yarn.data.saveTo(savePath, yarn.data.getSaveData('json'), () => {
    ipcRenderer.send('yarn-changes-saved', savePath, receivedData);
    remote.getCurrentWindow().close();
  });
};

const closeWindow = () => {
  remote.getCurrentWindow().close();
};

const editorFrameEl = document.getElementById('yarn-frame');
window.addEventListener('yarnReady', e => {
  yarn = e;
  yarn.app.fs = fs;
  ipcRenderer.send('yarn-ready');
});
editorFrameEl.src = 'yarn-editor/app/index.html';

// Called to load yarn data. Should be called after the window is fully loaded.

ipcRenderer.on('yarn-open', (event, receivedOptions) => {
  if (!yarn) return;

  //Make a header
  const pathEditorHeaderDiv = document.getElementById('path-editor-header');
  const pathControl = createPathEditorHeader({
    parentElement: pathEditorHeaderDiv,
    editorContentDocument: document,
    onSaveToGd: saveAndCloseCustomPath,
    onCancelChanges: closeWindow,
    projectPath: receivedOptions.projectPath,
    initialResourcePath: receivedOptions.resourcePath,
    extension: '.json',
  });
  //inject custom save+close button
  const saveToGdButton = yarn.document
    .getElementsByClassName('menu')[0]
    .cloneNode(true);
  saveToGdButton.onclick = () => saveAndClose();
  yarn.document
    .getElementsByClassName('app-menu')[0]
    .appendChild(saveToGdButton);
  saveToGdButton.childNodes[0].firstChild.data = 'Save & close';

  // process file
  if (fileExists(receivedOptions.resourcePath)) {
    receivedOptions.externalEditorData = fs
      .readFileSync(receivedOptions.resourcePath, 'utf8')
      .toString();

    yarn.data.loadData(receivedOptions.externalEditorData, 'json', true);
    electronWindow.setTitle('Yarn in GD: ' + receivedOptions.resourcePath);

    pathControl.toggle();
  } else {
    // If GD has sent no path, we need to create one for the new object
    receivedOptions.resourcePath =
      receivedOptions.projectPath + '/NewFile.json';
  }

  receivedData = receivedOptions;
  yarn.data.editingPath(receivedOptions.resourcePath);
  yarn.data.editingType('json');
});
