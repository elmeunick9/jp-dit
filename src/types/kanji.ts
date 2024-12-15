// KanjiDetail.ts
import { KanjiDictEntry } from '../types/dictionary';

export interface KanjiDetail extends KanjiDictEntry {
  mnemonic: string;
  relatedKanji: KanjiDictEntry[];
}

export interface KanjiDamageEntry {
  components: { literal: string, meaning: string|null }[]
  mnemonic?: string
}