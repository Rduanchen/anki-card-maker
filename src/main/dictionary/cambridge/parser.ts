import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";
import type { Element } from "domhandler";
import type {
  Definition,
  DictionaryEntry,
  Example,
  Phonetic,
  WordModel,
} from "./types.js";

const BASE_URL = "https://dictionary.cambridge.org";

/**
 * Resolve a relative audio src to an absolute URL.
 */
function resolveAudio($el: CheerioAPI, audioEl: Element | null): string {
  if (!audioEl) return "";
  // Prefer mp3 source
  const mp3 = $el(audioEl).find('source[type="audio/mpeg"]').attr("src") ?? "";
  if (mp3) return mp3.startsWith("http") ? mp3 : `${BASE_URL}${mp3}`;
  const ogg = $el(audioEl).find('source[type="audio/ogg"]').attr("src") ?? "";
  return ogg.startsWith("http") ? ogg : `${BASE_URL}${ogg}`;
}

/**
 * Parse a `.pr.entry-body__el` block (one headword / POS group).
 */
function parseEntryBlock($: CheerioAPI, entryEl: Element): DictionaryEntry[] {
  const entries: DictionaryEntry[] = [];

  // Each `.pr.dsense` is a sense group under one POS block
  $(entryEl)
    .find(".pr.dsense")
    .each((_i, senseEl) => {
      // Primary: POS label inside the sense group
      let posText = $(senseEl).find(".pos.dsense_pos").first().text().trim();

      // Fallback: for the first entry, Cambridge puts POS in the entry block header
      // e.g. <div class="posgram dpos-g"><span class="pos dpos">noun</span>…</div>
      if (!posText) {
        posText = $(entryEl).find(".pos.dpos").first().text().trim();
      }
      const guideWord = $(senseEl)
        .find(".guideword.dsense_gw span")
        .first()
        .text()
        .trim();

      const definitions: Definition[] = [];

      $(senseEl)
        .find(".def-block.ddef_block")
        .each((_j, defEl) => {
          // Grammatical note e.g. [I] [T] [C] [U]
          const grammaticalNote = $(defEl)
            .find(".gram.dgram")
            .first()
            .text()
            .trim()
            .replace(/\s+/g, " ");

          // English definition text (strip inner anchor text cleanly)
          const explanationEl = $(defEl).find(".def.ddef_d.db").first();
          const explanation = explanationEl.text().trim().replace(/\s+/g, " ");

          // Chinese translation (first .trans.dtrans that is NOT inside .examp)
          const translationEl = $(defEl)
            .find(".trans.dtrans")
            .filter((_k, el) => $(el).closest(".examp").length === 0)
            .first();
          const translation = translationEl.text().trim();

          // Examples
          const examples: Example[] = [];
          $(defEl)
            .find(".examp.dexamp")
            .each((_k, exEl) => {
              const en = $(exEl)
                .find(".eg.deg")
                .first()
                .text()
                .trim()
                .replace(/\s+/g, " ");
              const exTranslation = $(exEl)
                .find(".trans.dtrans")
                .first()
                .text()
                .trim();
              if (en) {
                examples.push({ en, translation: exTranslation });
              }
            });

          if (explanation) {
            const def: Definition = {
              explanation,
              translation,
              ...(examples.length > 0 && { examples }),
              ...(grammaticalNote && { domain: guideWord || undefined }),
            };
            definitions.push(def);
          }
        });

      if (definitions.length > 0) {
        entries.push({
          pos: posText,
          definitions,
        });
      }
    });

  return entries;
}

/**
 * Parse the full HTML of a Cambridge Dictionary page into a `WordModel`.
 */
export function parseHTML(html: string, word: string): WordModel {
  const $ = cheerio.load(html);

  // ── Word ────────────────────────────────────────────────────────────────────
  const headword =
    $(".headword.hdb.tw-bw.dhw.dpos-h_hw .hw.dhw").first().text().trim() ||
    $(".hw.dhw").first().text().trim() ||
    word;

  // ── Phonetics ───────────────────────────────────────────────────────────────
  function extractPhonetic(regionSelector: string): Phonetic {
    const regionEl = $(
      `.dpron-i:has(.dreg:contains("${regionSelector}"))`,
    ).first();
    const ipa = regionEl.find(".ipa.dipa").first().text().trim();
    const audioEl = regionEl.find("audio").first();
    const audioUrl = audioEl.length ? resolveAudio($, audioEl[0] as Element) : "";
    return { ipa, audio: audioUrl, url: audioUrl };
  }

  const uk = extractPhonetic("uk");
  const us = extractPhonetic("us");

  // ── Entries ──────────────────────────────────────────────────────────────���───
  const allEntries: DictionaryEntry[] = [];

  $(".pr.entry-body__el").each((_i, entryEl) => {
    const parsed = parseEntryBlock($, entryEl as Element);
    allEntries.push(...parsed);
  });

  return {
    word: headword,
    phonetics: { uk, us },
    entries: allEntries,
    updatedAt: new Date().toISOString(),
  };
}
