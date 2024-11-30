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

export interface SearchResult {
  search: string;
  entry?: JMdictEntry;
  similarReadings: JMdictEntry[];
  similarWritings: JMdictEntry[];
}

export interface DictionaryState {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
}
