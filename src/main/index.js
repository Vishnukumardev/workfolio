import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';

// Function to create the main application window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}), // Set icon for Linux
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'), // Preload script
      sandbox: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,

    },
  });

  // Show the window when it's ready
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' }; // Prevent opening in the app
  });

  // Load the appropriate URL or HTML file based on environment
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Set app user model ID for Windows
  electronApp.setAppUserModelId('com.electron');

  // Default to open or close DevTools by F12 in development
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // Handle IPC events
  ipcMain.on('ping', () => console.log('pong'));

  createWindow();

  // On macOS, recreate the window when the dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// You can include additional app-specific main process code here
