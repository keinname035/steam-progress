const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('steam', {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: s => ipcRenderer.invoke('settings:set', s),
  loadLibrary: () => ipcRenderer.invoke('library:load'),
  getGoals: () => ipcRenderer.invoke('goals:get'),
  setGoal: (appid, goal) => ipcRenderer.invoke('goals:set', appid, goal),
});
