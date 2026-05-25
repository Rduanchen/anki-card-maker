import type { WordModel, DictionarySettings } from './types.js';

/**
 * 根據使用者的設定 (DictionarySettings) 過濾字典查詢結果 (WordModel)
 */
export function filterWordModel(model: WordModel, config?: DictionarySettings): WordModel {
  if (!config) return model;

  // 使用深拷貝避免修改到原始的資料
  const result: WordModel = JSON.parse(JSON.stringify(model));

  if (config.phonetics) {
    const { source, displayIpa, displayAudio } = config.phonetics;
    
    // 依據發音來源過濾
    if (source === 'uk') {
      result.phonetics.us = { ipa: '', audio: '', url: '' };
    } else if (source === 'us') {
      result.phonetics.uk = { ipa: '', audio: '', url: '' };
    }

    // 過濾音標與語音
    if (displayIpa === false) {
      if (result.phonetics.uk) result.phonetics.uk.ipa = '';
      if (result.phonetics.us) result.phonetics.us.ipa = '';
    }

    if (displayAudio === false) {
      if (result.phonetics.uk) { result.phonetics.uk.audio = ''; result.phonetics.uk.url = ''; }
      if (result.phonetics.us) { result.phonetics.us.audio = ''; result.phonetics.us.url = ''; }
    }
  }

  if (config.displayConfig) {
    const { maxDefinitions, maxExamplesPerDefinition, visibility } = config.displayConfig;

    result.entries.forEach(entry => {
      // 過濾最大釋義數量
      if (maxDefinitions !== undefined && entry.definitions.length > maxDefinitions) {
        entry.definitions = entry.definitions.slice(0, maxDefinitions);
      }

      entry.definitions.forEach(def => {
        // 根據 visibility 過濾各項欄位
        if (visibility?.domain === false) delete def.domain;
        if (visibility?.explanation === false) def.explanation = '';
        if (visibility?.translation === false) def.translation = '';
        if (visibility?.synonyms === false) delete def.synonyms;
        if (visibility?.antonyms === false) delete def.antonyms;

        if (visibility?.examples === false) {
          delete def.examples;
        } else if (def.examples) {
          // 過濾最大例句數量
          if (maxExamplesPerDefinition !== undefined && def.examples.length > maxExamplesPerDefinition) {
            def.examples = def.examples.slice(0, maxExamplesPerDefinition);
          }
          // 過濾例句翻譯
          if (visibility?.exampleTranslation === false) {
            def.examples.forEach(ex => {
              ex.translation = '';
            });
          }
        }
      });
    });
  }

  return result;
}
