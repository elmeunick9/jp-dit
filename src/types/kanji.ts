// KanjiDetail.ts
import { KanjiDictEntry } from '../types/dictionary';

export interface KanjiDetail extends KanjiDictEntry {
  mnemonic: string;
  relatedKanji: KanjiDictEntry[];
}
