export interface DictionaryEntry {
  word: string;
  reading?: string;
  meanings: string[];
  partOfSpeech?: string[];
}

export interface SearchResult {
  entry: DictionaryEntry;
  matchType: 'exact' | 'partial';
}

export interface DictionaryState {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
}
