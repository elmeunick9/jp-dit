import { SearchResult, JMdictEntry } from '../types/dictionary';
import { extractKanjiReadings } from '../utils/furigana';
import { KanjiCard } from './KanjiCard';
import styles from '../styles/SearchResultItem.module.css';
import { useState } from 'react';

interface SearchResultItemProps {
  result: SearchResult;
}

export const SearchResultItem = ({ result }: SearchResultItemProps) => {
  if (!result.entry) return null;

  const { entry, search, kanjiInfo } = result;
  const readings = entry.k_ele ? entry.r_ele.map(r => r.reb) : undefined;
  const meanings = entry.sense.map(s => s.gloss.map((g: string | { '#text': string }) => 
    typeof g === 'string' ? g : g['#text']
  ).join('; '));
  const partOfSpeech = entry.sense[0].pos;

  const renderWord = (word: string, readings?: string[]) => {
    if (!readings) {
      return <div className={styles.verticalText}>{word}</div>;
    }

    const kanjiReadings = extractKanjiReadings(word, readings, kanjiInfo);
    const hasMissingReadings = kanjiReadings.some(kr => kr.readings.length === 0);
    console.log(hasMissingReadings);
    let currentIndex = 0;

    return (
      <div className={styles.verticalText}>
        { !hasMissingReadings ? word.split('').map((char, index) => {
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
        }) : <ruby>{word}<rt>{readings[0]}</rt></ruby>}
      </div>
    );
  };

  const renderSimilarEntries = (entries: JMdictEntry[], title: string) => {
    const [showAll, setShowAll] = useState(false);
    
    if (!entries.length) return null;
  
    // Helper function to extract meaning
    const extractMeaning = (gloss: Array<string | { '#text': string }>): string => 
      gloss.map(g => typeof g === 'string' ? g : g['#text']).join('; ');
  
    // Render a single entry
    const renderEntry = (similar: JMdictEntry, index: number) => {
      const similarWord = similar.k_ele?.[0]?.keb || similar.r_ele[0].reb;
      const similarReadings = similar.k_ele ? similar.r_ele.map(r => r.reb) : undefined;
      const similarMeaning = extractMeaning(similar.sense[0].gloss);
  
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
    };
  
    return (
      <div className={styles.vocabularySection}>
        <h4 className={styles.vocabularyTitle}>{title}</h4>
        
        {/* Always show the first entry */}
        {renderEntry(entries[0], 0)}
        
        {/* Show "See more" link if there are more entries */}
        {entries.length > 1 && !showAll && (
          <button 
            onClick={() => setShowAll(true)} 
            className={styles.seeMoreButton}
          >
            See more
          </button>
        )}
        
        {/* Show additional entries when "See more" is clicked */}
        {showAll && entries.slice(1, 5).map((similar, index) => 
          renderEntry(similar, index + 1)
        )}
      </div>
    );
  };

  const renderKanjiSection = () => {
    if (!kanjiInfo || Object.keys(kanjiInfo).length === 0) return null;

    return (
      <>
        {/* Desktop version - full kanji cards */}
        <div className={styles.kanjiSectionDesktop}>
          <h4 className={styles.kanjiTitle}>Kanji Information</h4>
          <div className={styles.kanjiList}>
            {Object.entries(kanjiInfo).map(([kanji, info]) => (
              <KanjiCard 
                key={kanji}
                kanji={kanji}
                info={info}
              />
            ))}
          </div>
        </div>

        {/* Mobile version - mini kanji cards */}
        <div className={styles.kanjiSectionMobile}>
          <h4 className={styles.kanjiTitle}>Kanji Information</h4>
          <div className={styles.miniKanjiList}>
            {Object.entries(kanjiInfo).map(([kanji, info]) => (
              <KanjiCard 
                key={kanji}
                kanji={kanji}
                info={info}
                mini={true}
              />
            ))}
          </div>
        </div>
      </>
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
        {renderKanjiSection()}
        {renderSimilarEntries(result.similarReadings, 'Similar Readings')}
        {renderSimilarEntries(result.similarWritings, 'Similar Writings')}
      </div>
    </div>
  );
};
