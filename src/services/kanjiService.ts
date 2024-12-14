import { KanjiDetail } from '../types/kanji';

class KanjiService {
  private static instance: KanjiService;

  private constructor() {}

  public static getInstance(): KanjiService {
    if (!KanjiService.instance) {
      KanjiService.instance = new KanjiService();
    }
    return KanjiService.instance;
  }

  public async getKanjiDetails(kanji: string): Promise<KanjiDetail> {
    try {
      const response = await fetch(`/api/dictionary/kanji?q=${encodeURIComponent(kanji)}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Search failed');
      }
      return await response.json();
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }
}

export const kanjiService = KanjiService.getInstance();