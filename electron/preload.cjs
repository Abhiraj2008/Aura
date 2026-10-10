const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  
  // File dialogues
  openFileDialog: () => ipcRenderer.invoke('dialog-open-files'),
  openDirectoryDialog: () => ipcRenderer.invoke('dialog-open-folder'),
  
  // Audio file reading
  readAudioFile: (filePath) => ipcRenderer.invoke('read-audio-file', filePath),

  // Platform info
  platform: process.platform,
  isElectron: true
});

