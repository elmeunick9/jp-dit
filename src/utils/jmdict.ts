import { readFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { DictionaryEntry } from '@/types/dictionary';
import path from 'path';

interface JMdictEntry {
  ent_seq: string;
  k_ele?: Array<{
    keb: string;
    ke_inf?: string[];
    ke_pri?: string[];
  }>;
  r_ele: Array<{
    reb: string;
    re_nokanji?: boolean;
    re_restr?: string[];
    re_inf?: string[];
    re_pri?: string[];
  }>;
  sense: Array<{
    pos?: string[];
    gloss: Array<string | { '#text': string }>;
    field?: string[];
    misc?: string[];
  }>;
}

class JMdictParser {
  private static instance: JMdictParser;
  private entries: Map<string, DictionaryEntry[]>;
  private initialized: boolean;

  private constructor() {
    this.entries = new Map();
    this.initialized = false;
  }

  public static getInstance(): JMdictParser {
    if (!JMdictParser.instance) {
      JMdictParser.instance = new JMdictParser();
    }
    return JMdictParser.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const xmlData = readFileSync(path.join(process.cwd(), 'src/dict/JMdict_e'), 'utf8');
      const parser = new XMLParser({
        ignoreAttributes: false,
        isArray: (name, jpath) => {
          const arrayElements = ['k_ele', 'r_ele', 'sense', 'gloss', 'pos', 'field', 'misc', 'ke_inf', 'ke_pri', 're_inf', 're_pri', 're_restr'];
          return arrayElements.includes(name);
        }
      });

      const result = parser.parse(xmlData);
      const jmdictEntries: JMdictEntry[] = result.JMdict.entry;

      for (const entry of jmdictEntries) {
        const dictionaryEntry = this.convertToDictionaryEntry(entry);
        
        // Index by kanji (if available)
        if (entry.k_ele) {
          entry.k_ele.forEach(k => {
            if (!this.entries.has(k.keb)) {
              this.entries.set(k.keb, []);
            }
            this.entries.get(k.keb)?.push(dictionaryEntry);
          });
        }

        // Index by reading
        entry.r_ele.forEach(r => {
          if (!this.entries.has(r.reb)) {
            this.entries.set(r.reb, []);
          }
          this.entries.get(r.reb)?.push(dictionaryEntry);
        });
      }

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing JMdict parser:', error);
      throw error;
    }
  }

  private convertToDictionaryEntry(entry: JMdictEntry): DictionaryEntry {
    const mainKanji = entry.k_ele?.[0]?.keb;
    const mainReading = entry.r_ele[0].reb;
    const meanings = entry.sense.map(s => {
      const glosses = s.gloss.map(g => typeof g === 'string' ? g : g['#text']);
      return glosses.join('; ');
    });
    const partOfSpeech = entry.sense[0]?.pos || [];

    return {
      word: mainKanji || mainReading,
      reading: mainKanji ? mainReading : undefined,
      meanings,
      partOfSpeech: partOfSpeech.map(pos => pos.replace(/&([^;]+);/g, '$1'))
    };
  }

  public search(query: string): DictionaryEntry[] {
    if (!this.initialized) {
      throw new Error('JMdict parser not initialized');
    }

    const results = new Set<DictionaryEntry>();
    const normalizedQuery = query.toLowerCase();

    // Direct matches
    if (this.entries.has(query)) {
      this.entries.get(query)?.forEach(entry => results.add(entry));
    }

    // Partial matches
    this.entries.forEach((entries, key) => {
      if (key.toLowerCase().includes(normalizedQuery)) {
        entries.forEach(entry => results.add(entry));
      } else {
        entries.forEach(entry => {
          if (entry.meanings.some(meaning => 
            meaning.toLowerCase().includes(normalizedQuery)
          )) {
            results.add(entry);
          }
        });
      }
    });

    return Array.from(results);
  }
}

export const jmdict = JMdictParser.getInstance();
