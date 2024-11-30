import * as wanakana from 'wanakana';
import { SearchResult } from '@/types/dictionary';

class DictionaryService {
  private static instance: DictionaryService;

  private constructor() {}

  public static getInstance(): DictionaryService {
    if (!DictionaryService.instance) {
      DictionaryService.instance = new DictionaryService();
    }
    return DictionaryService.instance;
  }

  public async searchWord(query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(`/api/dictionary/search?q=${encodeURIComponent(query)}`);
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

  public isJapanese(text: string): boolean {
    return wanakana.isJapanese(text);
  }

  public toHiragana(text: string): string {
    return wanakana.toHiragana(text);
  }

  public toKatakana(text: string): string {
    return wanakana.toKatakana(text);
  }

  public toRomaji(text: string): string {
    return wanakana.toRomaji(text);
  }
}

export const dictionaryService = DictionaryService.getInstance();
