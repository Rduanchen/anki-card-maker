import { ipcMain } from 'electron'
import { DictionaryService } from '../service/dictionary.service.js'

export class DictionaryController {
  private service: DictionaryService

  constructor() {
    this.service = new DictionaryService()
    this.registerRoutes()
  }

  private registerRoutes() {
    ipcMain.handle('dictionary:getDictionaries', async (_, words: string[], config?: any) => {
      const result: any = await this.service.getDictionaries(words, config)
      return result
    })

    ipcMain.handle('dictionary:autocomplete', async (_, word: string) => {
      return await this.service.getAutoComplete(word)
    })
  }
}

export function initDictionaryController() {
  new DictionaryController()
}
