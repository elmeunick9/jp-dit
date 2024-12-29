import { readFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';
import path from 'path';
import { JMdictEntry, SearchResult } from '../types/dictionary';
import { kanjidict } from './kanjidict';
import { unconjugate } from './conjugations';
import kuromoji from 'kuromoji';

class JMdictParser {
  private static instance: JMdictParser;
  private entries: JMdictEntry[];
  private initialized: boolean;

  tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null = null;

  private constructor() {
    this.entries = [];
    this.initialized = false;
  }

  public static getInstance(): JMdictParser {
      // @ts-ignore
      if (global.jmDict) {
        console.log('jmDict reused');
  
        // @ts-ignore
        return global.jmDict;
      }

    if (!JMdictParser.instance) {
      JMdictParser.instance = new JMdictParser();
    }

    // @ts-ignore
    global.jmDict = JMdictParser.instance;
    return JMdictParser.instance;
  }

  private isKanji(char: string): boolean {
    return char >= '\u4e00' && char <= '\u9faf';
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const dictPath = path.join(process.cwd(), 'src/dict/JMdict_e');
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

      // Initialize tokenizer
      this.tokenizer = await new Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>>((resolve, reject) => {
        kuromoji.builder({ dicPath: 'node_modules/kuromoji/dict/' }).build((err, tokenizer) => {
          if (err) return reject(err);
          resolve(tokenizer);
        });
      });

      this.initialized = true;
      console.log('JMdict parser initialized');
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
  public search(query: string, forward = false, max_results = 10): SearchResult {
    if (!this.initialized) {
      throw new Error('JMdict parser not initialized');
    }

    const exactK: JMdictEntry[] = [];
    const exactR: JMdictEntry[] = [];
    const partialK: JMdictEntry[] = [];
    const partialR: JMdictEntry[] = [];

    const isPartial = (str: string, sub: string): boolean => {
      if (forward) {
        return str.startsWith(sub);
      } else {
        return str.includes(sub);
      }
    }

    for (const entry of this.entries) {
      for (const k_ele of entry.k_ele ?? []) {
        if (k_ele.keb === query) {
          exactK.push(entry);
          break;
        } else if (max_results > partialK.length + partialR.length && isPartial(k_ele.keb, query)) {
          partialK.push(entry);
          break;
        }
      }
      for (const r_ele of entry.r_ele) {
        if (r_ele.reb === query) {
          exactR.push(entry);
          break;
        } else if (max_results > partialK.length + partialR.length && isPartial(r_ele.reb, query)) {
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

    // Tokenize the input expression
    const tokens = this.tokenizer!.tokenize(expr);
    const results: SearchResult[] = [];

    let lastMatchedToken = null
    let lastMatchedToken2 = null
    for (const token of tokens) {
      let surface = token.surface_form; // Original token text
      const baseForm = token.basic_form || surface; // Dictionary form or original text
      
      // Search for the dictionary form
      let match: SearchResult = { search: surface, entry: undefined, similarReadings: [], similarWritings: [], kanjiInfo: undefined };
      
      const isSingleCharNonKanji = surface.length === 1 && !this.isKanji(surface);
      if (token.word_type === "KNOWN" && !token.conjugated_type.startsWith("特殊") && !isSingleCharNonKanji) {
        match = this.search(surface);

        if (!match.entry && surface !== baseForm) {
          match = this.search(baseForm);
        }
      }

      // Special case for composed words

      let matched2 = false
      if (lastMatchedToken2 && lastMatchedToken) {
        const joinMatch2 = this.search(lastMatchedToken2.surface_form + lastMatchedToken.surface_form + surface);
        if (joinMatch2.entry) {
          match = joinMatch2;
          surface = joinMatch2.search;
          console.log("AT MATCH 2:", results.at(-1), results.at(-2));
          if (lastMatchedToken2.surface_form + lastMatchedToken.surface_form === `${results.at(-1)?.search}${results.at(-2)?.search}`) {
            results.pop();
            results.pop();
          } else {
            results.pop();
          }
          matched2 = true;
        }
      }

      if (!matched2 && lastMatchedToken) {
        const joinMatch = this.search(lastMatchedToken.surface_form + surface);

        if (joinMatch.entry) {
          match = joinMatch;
          surface = joinMatch.search;
          results.pop();
        }
      }

      if (match.entry) {
        results.push({
          ...match,
          token,
          search: surface, // Include the original token
        });
      } else {
        results.push({
          search: surface,
          entry: undefined,
          similarReadings: [],
          similarWritings: [],
          kanjiInfo: undefined,
          token
        });
      }

      lastMatchedToken2 = lastMatchedToken;
      lastMatchedToken = token;
    }

    return results;
  }
}

export const jmdict = JMdictParser.getInstance();
