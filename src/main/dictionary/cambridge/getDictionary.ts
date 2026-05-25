import axios, { AxiosError } from "axios";
import { parseHTML } from "./parser.js";
import type { WordModel, DictionarySettings, BatchDictionaryResult } from "./types.js";
import { filterWordModel } from "./filter.js";

const BASE_URL = "https://dictionary.cambridge.org/dictionary/english-chinese-traditional/";

/**
 * Fetch and parse a Cambridge English-Chinese (Traditional) dictionary entry.
 *
 * @param word - The English word to look up.
 * @returns A `WordModel` containing phonetics, definitions, translations and examples.
 * @throws If the word is not found or the network request fails.
 */
export async function getDictionary(word: string, config?: DictionarySettings): Promise<WordModel> {
  if (!word || !word.trim()) {
    throw new Error("Word must not be empty.");
  }

  const url = `${BASE_URL}/${encodeURIComponent(word.trim().toLowerCase())}`;

  let html: string;
  try {
    const response = await axios.get<string>(url, {
      headers: {
        // Mimic a real browser to avoid 403 responses
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        Referer: "https://dictionary.cambridge.org/",
      },
      timeout: 10_000,
    });
    html = response.data;
    console.log(`Fetched dictionary page for "${word}" successfully.`);
  } catch (err) {
    const axiosErr = err as AxiosError;
    if (axiosErr.response?.status === 404) {
      throw new Error(`Word not found: "${word}"`);
    }
    throw new Error(
      `Network error while fetching "${word}": ${axiosErr.message}`,
    );
  }

  const model = parseHTML(html, word);

  if (model.entries.length === 0) {
    throw new Error(`No dictionary entries found for "${word}".`);
  }

  return filterWordModel(model, config);
}

/**
 * 批次取得多個單字的字典資料 (併發執行)
 *
 * @param words - 要查詢的單字陣列
 * @param config - 可選的過濾設定
 * @returns 包含狀態 (status)、成功取得的字典資料陣列 (dictionaries) 以及失敗的單字陣列 (fail)
 */
export async function getDictionaries(
  words: string[],
  config?: DictionarySettings
): Promise<BatchDictionaryResult> {
  const promises = words.map(async (word) => {
    try {
      const model = await getDictionary(word, config);
      return { word, success: true, data: model };
    } catch (error) {
      return { word, success: false, error };
    }
  });

  const results = await Promise.all(promises);

  const dictionaries: WordModel[] = [];
  const fail: string[] = [];

  for (const res of results) {
    if (res.success && res.data) {
      dictionaries.push(res.data);
    } else {
      fail.push(res.word);
    }
  }

  let status: 'success' | 'fail' | 'partial' = 'success';
  if (words.length > 0) {
    if (fail.length === words.length) {
      status = 'fail';
    } else if (fail.length > 0) {
      status = 'partial';
    }
  }

  const result: BatchDictionaryResult = {
    status,
    dictionaries,
  };

  if (fail.length > 0) {
    result.fail = fail;
  }

  return result;
}

interface AutoCompleteItem {
  word: string;
  url: string;
  beta: boolean;
}

/**
 * 取得字典的自動補齊 (Auto-complete) 建議
 *
 * @param word - 想要查詢的前綴或單字
 * @returns 回傳符合條件 (beta 為 false) 的單字陣列
 */
export async function getAutoComplete(word: string): Promise<string[]> {
  if (!word || !word.trim()) {
    return [];
  }

  const query = encodeURIComponent(word.trim());
  const url = `https://dictionary.cambridge.org/autocomplete/amp?dataset=english-chinese-traditional&q=${query}`;

  try {
    const response = await axios.get<AutoCompleteItem[]>(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
        Accept: "application/json, text/plain, */*",
        Referer: "https://dictionary.cambridge.org/",
      },
      timeout: 5000,
    });

    const data = response.data;
    if (!Array.isArray(data)) {
      return [];
    }

    // 只保留 beta 為 false 的項目，並映射為字串陣列
    return data
      .filter(item => item.beta === false && item.word)
      .map(item => item.word);
  } catch (err) {
    console.error(`Error fetching autocomplete for "${word}":`, err);
    return [];
  }
}
