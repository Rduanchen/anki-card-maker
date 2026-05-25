/**
 * 詞典資料模型 (Dictionary Model Prototype)
 * 參考 Cambridge Dictionary 的結構設計
 */

export interface Example {
  en: string;
  translation: string;
  audio?: string;
}

export interface Definition {
  domain?: string;
  explanation: string;
  translation: string;
  examples?: Example[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface DictionaryEntry {
  pos: string;
  grammaticalNote?: string;
  inflections?: string[];
  definitions: Definition[];
}

export interface Phonetic {
  ipa: string;
  audio: string;
  url: string;
}

export interface WordModel {
  word: string;
  phonetics: {
    uk: Phonetic;
    us: Phonetic;
  };
  entries: DictionaryEntry[];
  updatedAt: string;
}

export interface DictionarySettings {
  url?: string;
  phonetics?: {
    source?: "uk" | "us" | "both";
    displayIpa?: boolean;
    displayAudio?: boolean;
  };

  displayConfig?: {
    maxDefinitions?: number;
    maxExamplesPerDefinition?: number;
    visibility: {
      domain?: boolean;
      explanation?: boolean;
      translation?: boolean;
      examples?: boolean;
      exampleTranslation?: boolean;
      synonyms?: boolean;
      antonyms?: boolean;
    };
  };
}

export interface BatchDictionaryResult {
  status: 'success' | 'fail' | 'partial';
  dictionaries: WordModel[];
  fail?: string[];
}