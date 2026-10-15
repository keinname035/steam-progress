const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('steam', {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: s => ipcRenderer.invoke('settings:set', s),
  loadLibrary: () => ipcRenderer.invoke('library:load'),
});
