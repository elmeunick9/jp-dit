interface KanjiReading {
  kanji: string;
  readings: string[];
}

export function extractKanjiReadings(word: string, readings: string[]): KanjiReading[] {
  const result: KanjiReading[] = [];
  const kanjiRegex = /[\u4e00-\u9faf]/;
  const hiraganaRegex = /[\u3040-\u309F]/;
  
  // Find all kanji positions in the word
  const kanjiPositions: { kanji: string; index: number }[] = [];
  for (let i = 0; i < word.length; i++) {
    if (kanjiRegex.test(word[i])) {
      kanjiPositions.push({ kanji: word[i], index: i });
    }
  }
  
  if (kanjiPositions.length === 0) return [];

  const kanjiReadingsMap = new Map<string, Set<string>>();

  readings.forEach(reading => {
    let readingIndex = 0;
    
    kanjiPositions.forEach((kanjiPos, idx) => {
      // Count hiragana before this kanji
      if (idx > 0) {
        const prevKanjiEnd = kanjiPositions[idx - 1].index + 1;
        for (let i = prevKanjiEnd; i < kanjiPos.index; i++) {
          if (hiraganaRegex.test(word[i])) {
            readingIndex++;
          }
        }
      } else {
        // Count hiragana before first kanji
        for (let i = 0; i < kanjiPos.index; i++) {
          if (hiraganaRegex.test(word[i])) {
            readingIndex++;
          }
        }
      }

      // Get the reading for this kanji
      const kanjiReading = reading.slice(readingIndex, readingIndex + 1);
      
      if (!kanjiReadingsMap.has(kanjiPos.kanji)) {
        kanjiReadingsMap.set(kanjiPos.kanji, new Set());
      }
      kanjiReadingsMap.get(kanjiPos.kanji)?.add(kanjiReading);

      // Move past this kanji's reading
      readingIndex++;
    });
  });

  // Convert the map to our result format
  kanjiPositions.forEach(({ kanji }) => {
    const readings = Array.from(kanjiReadingsMap.get(kanji) || []);
    result.push({
      kanji,
      readings: readings.length > 0 ? readings : ['']
    });
  });

  return result;
}
