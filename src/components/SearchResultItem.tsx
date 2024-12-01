import { SearchResult, JMdictEntry } from '../types/dictionary';
import styles from '../styles/SearchResultItem.module.css';

interface SearchResultItemProps {
  result: SearchResult;
}

export const SearchResultItem = ({ result }: SearchResultItemProps) => {
  if (!result.entry) return null;

  const { entry } = result;
  const word = entry.k_ele?.[0]?.keb || entry.r_ele[0].reb;
  const reading = entry.k_ele ? entry.r_ele[0].reb : undefined;
  const meanings = entry.sense.map(s => s.gloss.map((g: string | { '#text': string }) => 
    typeof g === 'string' ? g : g['#text']
  ).join('; '));
  const partOfSpeech = entry.sense[0].pos;

  const renderSimilarEntries = (entries: JMdictEntry[], title: string) => {
    if (!entries.length) return null;

    return (
      <div className={styles.vocabularySection}>
        <h4 className={styles.vocabularyTitle}>{title}</h4>
        {entries.slice(0, 5).map((similar, index) => {
          const similarWord = similar.k_ele?.[0]?.keb || similar.r_ele[0].reb;
          const similarReading = similar.k_ele ? similar.r_ele[0].reb : undefined;
          const similarMeaning = similar.sense[0].gloss.map((g: string | { '#text': string }) => 
            typeof g === 'string' ? g : g['#text']
          ).join('; ');

          return (
            <div key={index} className={styles.vocabularyItem}>
              <span className={styles.vocabularyWord}>{similarWord}</span>
              {similarReading && (
                <span className={styles.vocabularyReading}>【{similarReading}】</span>
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
          {reading && (
            <span className={styles.furigana}>{reading}</span>
          )}
          <div className={styles.verticalText}>
            {word}
          </div>
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
