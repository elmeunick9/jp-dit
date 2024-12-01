import { KanjiDictEntry } from "@/types/dictionary";
import { toHiragana } from "wanakana";

interface KanjiReading {
  kanji: string;
  readings: string[];
}

export function extractKanjiReadings(
  word: string,
  readings: string[],
  kanjiInfo?: { [kanji: string]: KanjiDictEntry }
): KanjiReading[] {
  const result: KanjiReading[] = [];
  const kanjiRegex = /[\u4e00-\u9faf]/;
  
  // Normalize kana (remove diacritical marks)
  const normalizekana = (input: string): string =>
    input.normalize("NFD").replace(/[\u3099\u309A]/g, "");

  // Helper to normalize kanji readings from kanjiInfo
  const normalizeKanjiReadings = (readings: string[]): string[] =>
    readings.map((reading) => {
      const baseReading = reading.split(".")[0].replace("-", "");
      return toHiragana(baseReading);
    });

  const getKanjiReadings = (kanji: string): string[] => {
    if (!kanjiInfo || !kanjiInfo[kanji]) return [];
    const { onYomi, kunYomi } = kanjiInfo[kanji].readings;
    return normalizeKanjiReadings([...onYomi, ...kunYomi]);
  };

  readings.forEach((reading) => {
    const normalizedReading = reading;
    let readingCursor = 0;
    let wordCursor = 0;

    while (wordCursor < word.length) {
      const currentChar = word[wordCursor];
      
      if (kanjiRegex.test(currentChar)) {
        const possibleReadings = getKanjiReadings(currentChar);
        const remainingReading = normalizedReading.slice(readingCursor);

        // console.log("Kanji:", currentChar, "RemainingReading:", remainingReading, "PossibleReadings:", possibleReadings);
        
        // Categorize possible matches
        const matches = possibleReadings.map(r => {
          let c = 0;
          while (c < r.length && c < remainingReading.length && r[c] === remainingReading[c]) {
            c++;
          }

          return {
            reading: r,
            exact: remainingReading.startsWith(r),
            prefix: r.slice(0, c),
            continues: remainingReading[r.length] === word[wordCursor+1]
          }
        }).filter(m => m.prefix.length > 0);

        // Prioritize matches
        let bestReadingObj: { reading: string; exact: boolean; prefix: string; continues: boolean }|null = null;
        for (const match of matches) {
          console.log("Match:", match);
          if (!bestReadingObj) {
            bestReadingObj = match;
          }

          if (!bestReadingObj.exact && match.exact) {
            bestReadingObj = match;
            // console.log("Better exact match:", match);
          }
          else if (!bestReadingObj.continues && match.continues) {
            bestReadingObj = match;
            // console.log("Better continues match:", match);
          } 
          else if (!bestReadingObj.continues && match.prefix.length > bestReadingObj.prefix.length) {
            bestReadingObj = match;
            // console.log("Better prefix match:", match);
          }
        }

        const bestReading = bestReadingObj ? bestReadingObj.reading : null;

        // Add or update the result for this kanji
        let existingEntry = result.find(r => r.kanji === currentChar);
        if (!existingEntry) {
          result.push({ 
            kanji: currentChar, 
            readings: bestReading ? [bestReading] : [] 
          });
        } else if (bestReading && !existingEntry.readings.includes(bestReading)) {
          existingEntry.readings.push(bestReading);
        }

        // Move reading cursor if a reading was found
        if (bestReading) {
          readingCursor += bestReading.length;
        }
      } else {
        // For non-kanji characters, advance reading cursor if characters match
        if (readingCursor < normalizedReading.length && 
            normalizekana(currentChar) === normalizekana(normalizedReading[readingCursor])) {
          readingCursor++;
        }
      }

      wordCursor++;
    }
  });

  // Deduplicate and filter empty readings
  return result.map(entry => ({
    ...entry,
    readings: Array.from(new Set(entry.readings)).filter(r => r)
  }));
}