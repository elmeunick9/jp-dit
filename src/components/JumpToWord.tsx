import React from 'react';
import styles from '../styles/JumpToWord.module.css';
import { SearchResult } from '../types/dictionary';

interface JumpToWordProps {
  results: SearchResult[];
}

export const JumpToWord: React.FC<JumpToWordProps> = ({ results }) => {
  return (
    <>
    <div className={styles.marginBlank}></div>
    <div className={styles.jumpContainer}>
      <div className={styles.jumpContent}>
        {results.map((result, index) => (
          <React.Fragment key={`word-${index}`}>
            {result.entry ? (
              <a 
                href={`#word-${result.search}`}
                className={styles.wordLink}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(`word-${result.search}`);
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {result.search}
              </a>
            ) : (
              <span className={styles.wordText}>{result.search}</span>
            )}
            {index < results.length - 1 && ' '}
          </React.Fragment>
        ))}
      </div>
    </div>
    </>
  );
};
