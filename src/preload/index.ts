import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  dictionary: {
    getDictionaries: (words: string[], config?: any) => ipcRenderer.invoke('dictionary:getDictionaries', words, config),
    autocomplete: (word: string) => ipcRenderer.invoke('dictionary:autocomplete', word)
  },
  anki: {
    getDecks: () => ipcRenderer.invoke('anki:getDecks'),
    getModels: () => ipcRenderer.invoke('anki:getModels'),
    createModels: () => ipcRenderer.invoke('anki:createModels'),
    addNote: (deckName: string, modelName: string, fields: Record<string, string>, audioUrl?: string) => ipcRenderer.invoke('anki:addNote', deckName, modelName, fields, audioUrl)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
