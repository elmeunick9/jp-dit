import { readFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';
import path from 'path';
import { JMdictEntry, SearchResult } from '../types/dictionary';
import { kanjidict } from './kanjidict';

class JMdictParser {
  private static instance: JMdictParser;
  private entries: JMdictEntry[];
  private initialized: boolean;

  private constructor() {
    this.entries = [];
    this.initialized = false;
  }

  public static getInstance(): JMdictParser {
    if (!JMdictParser.instance) {
      JMdictParser.instance = new JMdictParser();
    }
    return JMdictParser.instance;
  }

  private isKanji(char: string): boolean {
    return char >= '\u4e00' && char <= '\u9faf';
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const dictPath = path.join(process.cwd(), 'src/dict/JMdict_e_mini');
      const xmlData = readFileSync(dictPath, 'utf8');
      const parser = new XMLParser({
        ignoreAttributes: false,
        isArray: (name) => {
          const arrayElements = ['k_ele', 'r_ele', 'sense', 'gloss', 'pos', 'field', 'misc', 'ke_inf', 'ke_pri', 're_inf', 're_pri', 're_restr'];
          return arrayElements.includes(name);
        }
      });

      const result = parser.parse(xmlData);
      this.entries = result.JMdict.entry;
      
      // Initialize kanjidict as well
      await kanjidict.initialize();

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing JMdict parser:', error);
      throw error;
    }
  }

  private getKanjiInfo(word: string) {
    const kanjiInfo: { [kanji: string]: any } = {};
    
    for (const char of word) {
      if (this.isKanji(char)) {
        const entry = kanjidict.search(char);
        if (entry) {
          kanjiInfo[char] = entry;
        }
      }
    }
    
    return kanjiInfo;
  }

  /* Search for a word in the dictionary */
  public search(query: string): SearchResult {
    if (!this.initialized) {
      throw new Error('JMdict parser not initialized');
    }

    const exactK: JMdictEntry[] = [];
    const exactR: JMdictEntry[] = [];
    const partialK: JMdictEntry[] = [];
    const partialR: JMdictEntry[] = [];

    for (const entry of this.entries) {
      for (const k_ele of entry.k_ele ?? []) {
        if (k_ele.keb === query) {
          exactK.push(entry);
          break;
        } else if (k_ele.keb.includes(query)) {
          partialK.push(entry);
          break;
        }
      }
      for (const r_ele of entry.r_ele) {
        if (r_ele.reb === query) {
          exactR.push(entry);
          break;
        } else if (r_ele.reb.includes(query)) {
          partialR.push(entry);
          break;
        }
      }
    }

    let entry = exactK[0] || exactR[0];
    
    // Get kanji information from the search query
    const kanjiInfo = this.getKanjiInfo(query);

    return {
      search: query,
      entry,
      similarReadings: [...exactR, ...partialR].filter((x) => x !== entry),
      similarWritings: [...exactK, ...partialK].filter((x) => x !== entry),
      kanjiInfo
    };
  }

  /** Find each word in a phrase */
  public match(expr: string): SearchResult[] {
    if (!this.initialized) {
      throw new Error('JMdict parser not initialized');
    }
    
    const match = this.search(expr);
    if (match.entry) return [match];

    const results: SearchResult[] = [];
    while (expr.length > 0) {
      const char = expr[0];
      const match = this.search(char);
      let found = null;

      // Try to find longest match
      if (match.similarWritings.length > 0) {
        for (const similar of match.similarWritings) {
          for (const k_ele of similar.k_ele ?? []) {
            if (expr.startsWith(k_ele.keb) && (!found || k_ele.keb.length > found.length)) {
              found = k_ele.keb;
            }
          }
        }
        if (found) {
          const exactMatch = this.search(found);
          results.push(exactMatch);
          expr = expr.slice(found.length);
        }

      // Try to find exact match
      } else if (match.entry) {
        results.push(match);
        expr = expr.slice(char.length);
        found = true;
      }

      if (!found) {
        results.push({
          search: char,
          entry: undefined,
          similarReadings: [],
          similarWritings: [],
          kanjiInfo: undefined
        });
        expr = expr.slice(1);
      }
    }

    return results;
  }
}

export const jmdict = JMdictParser.getInstance();
