import { getDictionaries, getAutoComplete } from '../cambridge/getDictionary.js';
import type { DictionarySettings } from '../cambridge/types.js';

export class DictionaryService {
  public async getDictionaries(words: string[], config?: DictionarySettings) {
    return await getDictionaries(words, config);
  }

  public async getAutoComplete(word: string) {
    return await getAutoComplete(word);
  }
}
