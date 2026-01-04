const { app, BrowserWindow, protocol, ipcMain } = require('electron');
const path = require('path');
require('dotenv').config();

// Import authentication handlers
const FacebookAuth = require('./auth/facebook');
const TikTokAuth = require('./auth/tiktok');
const YouTubeAuth = require('./auth/youtube');
const InstagramAuth = require('./auth/instagram');

// Import credential storage
const CredentialStore = require('./storage/credentials');

let mainWindow;
const credentialStore = new CredentialStore();

// Custom protocol for OAuth callbacks
const PROTOCOL = process.env.CUSTOM_URL_PROTOCOL || 'shortposter';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false
    },
    icon: path.join(__dirname, '../../build/icon.ico'),
    backgroundColor: '#1a1a2e',
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Register custom protocol for OAuth callbacks
function registerProtocol() {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
    }
  } else {
    app.setAsDefaultProtocolClient(PROTOCOL);
  }
}

// Handle OAuth callback URLs
function handleProtocolUrl(url) {
  console.log('Protocol URL received:', url);
  
  // Parse the URL to determine which platform
  const urlObj = new URL(url);
  const platform = urlObj.searchParams.get('platform');
  const code = urlObj.searchParams.get('code');
  const state = urlObj.searchParams.get('state');
  
  if (mainWindow) {
    mainWindow.webContents.send('oauth-callback', { platform, code, state, url });
  }
}

// App lifecycle
app.whenReady().then(() => {
  registerProtocol();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle protocol URLs on Windows
app.on('second-instance', (event, commandLine, workingDirectory) => {
  // Someone tried to run a second instance, focus our window instead
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }

  // Handle protocol URL
  const url = commandLine.find(arg => arg.startsWith(`${PROTOCOL}://`));
  if (url) {
    handleProtocolUrl(url);
  }
});

// Handle protocol URLs on macOS
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleProtocolUrl(url);
});

// IPC Handlers for Authentication
ipcMain.handle('auth:facebook:login', async () => {
  try {
    const auth = new FacebookAuth(credentialStore);
    return await auth.login();
  } catch (error) {
    console.error('Facebook login error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('auth:tiktok:login', async () => {
  try {
    const auth = new TikTokAuth(credentialStore);
    return await auth.login();
  } catch (error) {
    console.error('TikTok login error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('auth:youtube:login', async () => {
  try {
    const auth = new YouTubeAuth(credentialStore);
    return await auth.login();
  } catch (error) {
    console.error('YouTube login error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('auth:instagram:login', async () => {
  try {
    const auth = new InstagramAuth(credentialStore);
    return await auth.login();
  } catch (error) {
    console.error('Instagram login error:', error);
    return { success: false, error: error.message };
  }
});

// IPC Handlers for checking auth status
ipcMain.handle('auth:status', async () => {
  return {
    facebook: credentialStore.hasCredentials('facebook'),
    tiktok: credentialStore.hasCredentials('tiktok'),
    youtube: credentialStore.hasCredentials('youtube'),
    instagram: credentialStore.hasCredentials('instagram')
  };
});

// IPC Handler for logout
ipcMain.handle('auth:logout', async (event, platform) => {
  credentialStore.removeCredentials(platform);
  return { success: true };
});

// IPC Handler for video upload
ipcMain.handle('upload:video', async (event, { filePath, metadata, platforms }) => {
  try {
    const Uploader = require('./upload/uploader');
    const uploader = new Uploader(credentialStore);
    
    const results = await uploader.uploadToMultiplePlatforms(filePath, metadata, platforms);
    return { success: true, results };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: error.message };
  }
});

console.log('Social Media Auto-Poster started');
