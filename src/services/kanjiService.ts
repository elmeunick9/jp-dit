import { KanjiDetail } from '../types/kanji';

const dummyKanjiData: Record<string, KanjiDetail> = {
  日: {
    kanji: '日',
    onyomi: ['ニチ', 'ジツ'],
    kunyomi: ['ひ', 'か'],
    similarKanji: ['月', '木', '田'],
    mnemonic: 'This kanji represents the sun.'
  },
  水: {
    kanji: '水',
    onyomi: ['スイ'],
    kunyomi: ['みず'],
    similarKanji: ['氷', '泉'],
    mnemonic: 'This kanji represents water.'
  }
};

export const kanjiService = {
  getKanjiDetails: async (kanji: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (dummyKanjiData[kanji]) {
      return dummyKanjiData[kanji];
    } else {
      throw new Error('Kanji not found');
    }
  }
};
