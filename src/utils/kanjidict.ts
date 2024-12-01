import { readFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';
import path from 'path';
import { KanjiDictEntry } from '../types/dictionary';

class KanjiDict {
  private static instance: KanjiDict;
  private entries: Map<string, KanjiDictEntry>;
  private initialized: boolean;

  private constructor() {
    this.entries = new Map();
    this.initialized = false;
  }

  public static getInstance(): KanjiDict {
    // @ts-ignore
    if (global.kanjiDict) {
      console.log('KanjiDict reused');

      // @ts-ignore
      return global.kanjiDict;
    }

    if (!KanjiDict.instance) {
      KanjiDict.instance = new KanjiDict();
    }
    // @ts-ignore
    global.kanjiDict = KanjiDict.instance;

    return KanjiDict.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const dictPath = path.join(process.cwd(), 'src/dict/kanjidic2.xml');
      const xmlData = readFileSync(dictPath, 'utf8');
      const parser = new XMLParser({
        ignoreAttributes: false,
        isArray: (name) => {
          const arrayElements = ['character', 'reading', 'meaning', 'nanori'];
          return arrayElements.includes(name);
        },
        attributeNamePrefix: ''
      });

      const result = parser.parse(xmlData);
      
      // Process each character entry
      for (const char of result.kanjidic2.character) {
        const entry: KanjiDictEntry = {
          literal: char.literal,
          strokeCount: Number(Array.isArray(char.misc.stroke_count) 
            ? char.misc.stroke_count[0] 
            : char.misc.stroke_count),
          readings: {
            onYomi: [],
            kunYomi: []
          },
          meanings: []
        };

        // Add optional fields if they exist
        if (char.misc.grade) {
          entry.grade = Number(char.misc.grade);
        }
        if (char.misc.jlpt) {
          entry.jlpt = Number(char.misc.jlpt);
        }

        // Process readings and meanings
        if (char.reading_meaning && char.reading_meaning.rmgroup) {
          const rmgroup = char.reading_meaning.rmgroup;
          
          // Process readings
          if (rmgroup.reading) {
            for (const reading of rmgroup.reading) {
              if (reading.r_type === 'ja_on') {
                entry.readings.onYomi.push(reading['#text']);
              } else if (reading.r_type === 'ja_kun') {
                entry.readings.kunYomi.push(reading['#text']);
              }
            }
          }

          // Process meanings
          if (rmgroup.meaning) {
            for (const meaning of rmgroup.meaning) {
              // Only include English meanings (no m_lang attribute or m_lang="en")
              if (typeof meaning === 'string') {
                entry.meanings.push(meaning);
              } else if (!meaning.m_lang || meaning.m_lang === 'en') {
                entry.meanings.push(meaning['#text']);
              }
            }
          }
        }

        this.entries.set(entry.literal, entry);
      }

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing KanjiDict:', error);
      throw error;
    }
  }

  public search(kanji: string): KanjiDictEntry | undefined {
    if (!this.initialized) {
      throw new Error('KanjiDict not initialized');
    }
    return this.entries.get(kanji);
  }
}

export const kanjidict = KanjiDict.getInstance();
