const electron = require('electron');
const path = require('path');
const app = electron.app; // Module to control application life.
const BrowserWindow = electron.BrowserWindow; // Module to create native browser window.
const Menu = electron.Menu;
const Notification = electron.Notification;
const protocol = electron.protocol;
const parseArgs = require('minimist');
const isDev = require('electron-is').dev();
const ipcMain = electron.ipcMain;
const autoUpdater = require('electron-updater').autoUpdater;
const log = require('electron-log');
const { uploadLocalFile } = require('./LocalFileUploader');
const { serveFolder, stopServer } = require('./ServeFolder');
const { startDebuggerServer, sendMessage } = require('./DebuggerServer');
const { buildMainMenuFor, buildPlaceholderMainMenu } = require('./MainMenu');
const { loadModalWindow } = require('./ModalWindow');
const { load, registerGdideProtocol } = require('./Utils/UrlLoader');
const throttle = require('lodash.throttle');
const { findLocalIp } = require('./Utils/LocalNetworkIpFinder');
const discordClient = require('discord-rich-presence')('718194112775454720');
discordClient.on("error", _ => true); // Ignore error: They happen only when discord is not installed

log.info('GDevelop Electron app starting...');

// Logs made with electron-logs can be found
// on Linux: ~/.config/<app name>/log.log
// on OS X: ~/Library/Logs/<app name>/log.log
// on Windows: %USERPROFILE%\AppData\Roaming\<app name>\log.log
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
autoUpdater.autoDownload = false;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;

// Parse arguments (knowing that in dev, we run electron with an argument,
// so have to ignore one more).
const args = parseArgs(process.argv.slice(isDev ? 2 : 1), {
  // "Officially" supported arguments and their types:
  boolean: ['dev-tools', 'disable-update-check'],
  string: '_', // Files are always strings
});

// See registerGdideProtocol (used for HTML modules support)
protocol.registerSchemesAsPrivileged([{ scheme: 'gdide' }]);

// Should be set to true, which will be the default value in future Electron
// versions, but then causes an issue on Windows where the `fs` module stops
// working in the renderer process.
// See https://github.com/electron/electron/issues/22119
// For now, disable this as we rely heavily on `fs` in the renderer process.
app.allowRendererProcessReuse = false;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  app.quit();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  const isIntegrated = args.mode === 'integrated';
  const devTools = !!args['dev-tools'];

  if (isIntegrated && app.dock) {
    app.dock.hide();
  }

  registerGdideProtocol({ isDev });

  // Create the browser window.
  const options = {
    width: args.width || 800,
    height: args.height || 600,
    x: args.x,
    y: args.y,
    webPreferences: {
      webSecurity: false, // Allow to access to local files,
      nodeIntegration: true,
    },
    enableLargerThanScreen: true,
    backgroundColor: '#f0f0f0',
  };

  if (isIntegrated) {
    options.acceptFirstMouse = true;
    options.skipTaskbar = true;
    options.hasShadow = false;
    options.frame = false;
    options.minimizable = false;
    options.movable = false;
    options.resizable = false;
    options.fullscreenable = false;
    options.show = false;
  }

  if (isDev)
    BrowserWindow.addDevToolsExtension(
      path.join(__dirname, 'extensions/ReactDeveloperTools/4.2.1_0/')
    );

  mainWindow = new BrowserWindow(options);
  if (!isIntegrated) mainWindow.maximize();

  // Expose program arguments (to be accessed by mainWindow)
  global['args'] = args;

  // Load the index.html of the app.
  load({
    window: mainWindow,
    isDev,
    path: '/index.html',
    devTools,
  });

  Menu.setApplicationMenu(buildPlaceholderMainMenu());

  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
    stopServer(() => {});
  });

  ipcMain.on('set-main-menu', (event, mainMenuTemplate) => {
    Menu.setApplicationMenu(buildMainMenuFor(mainWindow, mainMenuTemplate));
  });

  //Prevent any navigation inside the main window.
  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (url !== mainWindow.webContents.getURL()) {
      console.info('Opening in browser (because of will-navigate):', url);
      e.preventDefault();
      electron.shell.openExternal(url);
    }
  });

  //Prevent opening any website or url inside Electron.
  mainWindow.webContents.on('new-window', (e, url) => {
    console.info('Opening in browser (because of new-window): ', url);
    e.preventDefault();
    electron.shell.openExternal(url);
  });

  ipcMain.on('piskel-open-then-load-animation', (event, externalEditorData) => {
    loadModalWindow({
      parentWindow: mainWindow,
      devTools,
      readyChannelName: 'piskel-ready',
      indexSubPath: 'piskel/piskel-index.html',
      backgroundColor: '#000000',
      onReady: piskelWindow => {
        piskelWindow.webContents.send(
          'piskel-load-animation',
          externalEditorData
        ),
          piskelWindow.show();
      },
    });
  });

  ipcMain.on(
    'piskel-changes-saved',
    (event, imageResources, newAnimationName, externalEditorData) => {
      mainWindow.webContents.send(
        'piskel-changes-saved',
        imageResources,
        newAnimationName,
        externalEditorData
      );
    }
  );

  // JFXR sound effect generator
  ipcMain.on('jfxr-create-wav', (event, externalEditorData) => {
    loadModalWindow({
      parentWindow: mainWindow,
      devTools,
      readyChannelName: 'jfxr-ready',
      indexSubPath: 'jfxr/jfxr-index.html',
      relativeWidth: 0.55,
      relativeHeight: 0.8,
      backgroundColor: '#000000',
      onReady: jfxrWindow => {
        jfxrWindow.webContents.send('jfxr-open', externalEditorData);
        jfxrWindow.show();
      },
    });
  });

  ipcMain.on('jfxr-changes-saved', (event, newFilePath, externalEditorData) => {
    mainWindow.webContents.send(
      'jfxr-changes-saved',
      newFilePath,
      externalEditorData
    );
  });

  // Yarn Dialogue Tree Editor
  ipcMain.on('yarn-create-json', (event, externalEditorData) => {
    loadModalWindow({
      parentWindow: mainWindow,
      devTools,
      readyChannelName: 'yarn-ready',
      indexSubPath: 'yarn/yarn-index.html',
      relativeWidth: 0.8,
      relativeHeight: 0.9,
      backgroundColor: '#000000',
      onReady: yarnWindow => {
        yarnWindow.webContents.send('yarn-open', externalEditorData);
        yarnWindow.show();
      },
    });
  });

  ipcMain.on('yarn-changes-saved', (event, newFilePath) => {
    mainWindow.webContents.send('yarn-changes-saved', newFilePath);
  });

  // Discord Rich Presence event:
  ipcMain.on('update-discord-rp', (event, config) => discordClient.updatePresence(config));

  // LocalFileUploader events:
  ipcMain.on('local-file-upload', (event, localFilePath, uploadOptions) => {
    log.info(
      'Received event local-file-upload with localFilePath=',
      localFilePath
    );

    uploadLocalFile(
      localFilePath,
      uploadOptions,
      throttle((current, max) => {
        event.sender.send('local-file-upload-progress', current, max);
      }, 300)
    ).then(
      () => {
        log.info('Local file upload succesfully done');
        event.sender.send('local-file-upload-done', null);
      },
      uploadError => {
        log.error('Local file upload errored', uploadError);
        event.sender.send('local-file-upload-done', uploadError);
      }
    );
  });

  // ServeFolder events:
  ipcMain.on('serve-folder', (event, options) => {
    log.info('Received event to server folder with options=', options);

    serveFolder(options, (err, serverParams) => {
      event.sender.send('serve-folder-done', err, serverParams);
    });
  });

  ipcMain.on('stop-server', event => {
    log.info('Received event to stop server');

    stopServer(err => {
      event.sender.send('stop-server-done', err);
    });
  });

  ipcMain.on('get-local-network-ip', event => {
    event.sender.send('local-network-ip', findLocalIp());
  });

  // DebuggerServer events:
  ipcMain.on('debugger-start-server', (event, options) => {
    log.info('Received event to start debugger server with options=', options);

    startDebuggerServer({
      onMessage: ({ id, message }) =>
        event.sender.send('debugger-message-received', { id, message }),
      onError: error => event.sender.send('debugger-error-received', error),
      onConnectionClose: ({ id }) =>
        event.sender.send('debugger-connection-closed', { id }),
      onConnectionOpen: ({ id }) =>
        event.sender.send('debugger-connection-opened', { id }),
      onListening: ({ address }) =>
        event.sender.send('debugger-start-server-done', { address }),
    });
  });

  ipcMain.on('debugger-send-message', (event, message) => {
    sendMessage(message, err =>
      event.sender.send('debugger-send-message-done', err)
    );
  });

  ipcMain.on('updates-check-and-download', event => {
    // This will immediately download an update, then install when the
    // app quits.
    log.info('Starting check for updates (with auto-download if any)');
    autoUpdater.autoDownload = true;
    autoUpdater.checkForUpdatesAndNotify();
  });

  ipcMain.on('updates-check', event => {
    log.info('Starting check for updates (without auto-download)');
    autoUpdater.autoDownload = false;
    autoUpdater.checkForUpdates();
  });

  function sendUpdateStatus(status) {
    log.info(status);
    if (mainWindow) mainWindow.webContents.send('update-status', status);
  }
  autoUpdater.on('checking-for-update', () => {
    sendUpdateStatus({
      message: 'Checking for update...',
      status: 'checking-for-update',
    });
  });
  autoUpdater.on('update-available', info => {
    sendUpdateStatus({
      message: 'Update available.',
      status: 'update-available',
    });
  });
  autoUpdater.on('update-not-available', info => {
    sendUpdateStatus({
      message: 'Update not available.',
      status: 'update-not-available',
    });
  });
  autoUpdater.on('error', err => {
    sendUpdateStatus({
      message: 'Error in auto-updater. ' + err,
      status: 'error',
      err,
    });
  });
  autoUpdater.on('download-progress', progressObj => {
    let logMessage = 'Download speed: ' + progressObj.bytesPerSecond;
    logMessage = logMessage + ' - Downloaded ' + progressObj.percent + '%';
    logMessage =
      logMessage +
      ' (' +
      progressObj.transferred +
      '/' +
      progressObj.total +
      ')';
    sendUpdateStatus({
      message: logMessage,
      status: 'download-progress',
      bytesPerSecond: progressObj.bytesPerSecond,
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total,
    });
  });
  autoUpdater.on('update-downloaded', info => {
    sendUpdateStatus({
      message: 'Update downloaded',
      status: 'update-downloaded',
      info,
    });
  });
});
