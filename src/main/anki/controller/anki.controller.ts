import { ipcMain } from 'electron';
import { AnkiService } from '../service/anki.service.js';

export class AnkiController {
  private service: AnkiService;

  constructor() {
    this.service = new AnkiService();
    this.registerRoutes();
  }

  private registerRoutes() {
    ipcMain.handle('anki:getDecks', async () => {
      return await this.service.getDecks();
    });

    ipcMain.handle('anki:getModels', async () => {
      return await this.service.getModels();
    });

    ipcMain.handle('anki:createModels', async () => {
      return await this.service.createModels();
    });

    ipcMain.handle('anki:addNote', async (_, deckName: string, modelName: string, fields: Record<string, string>, audioUrl?: string) => {
      return await this.service.addNote(deckName, modelName, fields, audioUrl);
    });
  }
}

export function initAnkiController() {
  new AnkiController();
}
