export interface JMdictEntry {
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

export interface KanjiDictEntry {
  literal: string;
  grade?: number;
  strokeCount?: number;
  jlpt?: number;
  readings: {
    onYomi: string[];
    kunYomi: string[];
  };
  meanings: string[];
}

export interface SearchResult {
  search: string;
  token?: any;
  entry?: JMdictEntry;
  similarReadings: JMdictEntry[];
  similarWritings: JMdictEntry[];
  kanjiInfo?: { [kanji: string]: KanjiDictEntry };
}

export interface SearchResponse {
  results: SearchResult[];
  time: number; // in ms
}

export interface DictionaryState {
  response?: SearchResponse;
  loading: boolean;
  error: string | null;
}
