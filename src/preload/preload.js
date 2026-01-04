const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Authentication APIs
  auth: {
    loginFacebook: () => ipcRenderer.invoke('auth:facebook:login'),
    loginTikTok: () => ipcRenderer.invoke('auth:tiktok:login'),
    loginYouTube: () => ipcRenderer.invoke('auth:youtube:login'),
    loginInstagram: () => ipcRenderer.invoke('auth:instagram:login'),
    getStatus: () => ipcRenderer.invoke('auth:status'),
    logout: (platform) => ipcRenderer.invoke('auth:logout', platform),
    onOAuthCallback: (callback) => ipcRenderer.on('oauth-callback', (event, data) => callback(data))
  },
  
  // Upload APIs
  upload: {
    video: (filePath, metadata, platforms) => 
      ipcRenderer.invoke('upload:video', { filePath, metadata, platforms })
  },
  
  // File selection
  selectFile: () => ipcRenderer.invoke('dialog:openFile')
});
