import { SearchResult, JMdictEntry } from '../types/dictionary';
import { extractKanjiReadings } from '../utils/furigana';
import styles from '../styles/SearchResultItem.module.css';

interface SearchResultItemProps {
  result: SearchResult;
}

export const SearchResultItem = ({ result }: SearchResultItemProps) => {
  if (!result.entry) return null;

  const { entry, search } = result;
  const readings = entry.k_ele ? entry.r_ele.map(r => r.reb) : undefined;
  const meanings = entry.sense.map(s => s.gloss.map((g: string | { '#text': string }) => 
    typeof g === 'string' ? g : g['#text']
  ).join('; '));
  const partOfSpeech = entry.sense[0].pos;

  const renderWord = (word: string, readings?: string[]) => {
    if (!readings) {
      return <div className={styles.verticalText}>{word}</div>;
    }

    const kanjiReadings = extractKanjiReadings(word, readings);
    let currentIndex = 0;

    return (
      <div className={styles.verticalText}>
        {word.split('').map((char, index) => {
          const kanjiReading = kanjiReadings.find(kr => 
            kr.kanji === char && index >= currentIndex
          );

          if (kanjiReading) {
            currentIndex = index + 1;
            return (
              <ruby key={index}>
                {char}
                <rt>{kanjiReading.readings[0]}</rt>
              </ruby>
            );
          }

          return char;
        })}
      </div>
    );
  };

  const renderSimilarEntries = (entries: JMdictEntry[], title: string) => {
    if (!entries.length) return null;

    return (
      <div className={styles.vocabularySection}>
        <h4 className={styles.vocabularyTitle}>{title}</h4>
        {entries.slice(0, 5).map((similar, index) => {
          const similarWord = similar.k_ele?.[0]?.keb || similar.r_ele[0].reb;
          const similarReadings = similar.k_ele ? similar.r_ele.map(r => r.reb) : undefined;
          const similarMeaning = similar.sense[0].gloss.map((g: string | { '#text': string }) => 
            typeof g === 'string' ? g : g['#text']
          ).join('; ');

          return (
            <div key={index} className={styles.vocabularyItem}>
              <span className={styles.vocabularyWord}>{similarWord}</span>
              {similarReadings && (
                <span className={styles.vocabularyReading}>【{similarReadings[0]}】</span>
              )}
              <div className={styles.vocabularyMeaning}>
                {similarMeaning}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.resultItem}>
      <div className={styles.wordSection}>
        <div className={styles.verticalTextContainer}>
          {renderWord(search, readings)}
        </div>
      </div>
      <div className={styles.contentSection}>
        <div className={styles.meaningSection}>
          {partOfSpeech && (
            <div className={styles.partOfSpeech}>
              {partOfSpeech.join(', ')}
            </div>
          )}
          <ul className={styles.meanings}>
            {meanings.map((meaning, index) => (
              <li key={index}>{meaning}</li>
            ))}
          </ul>
        </div>
        {renderSimilarEntries(result.similarReadings, 'Similar Readings')}
        {renderSimilarEntries(result.similarWritings, 'Similar Writings')}
      </div>
    </div>
  );
};
