import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import styles from '../styles/Home.module.css';
import { dictionaryService } from '../services/dictionaryService';
import { SearchResult, DictionaryState } from '../types/dictionary';

const Home: NextPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [state, setState] = useState<DictionaryState>({
    results: [],
    loading: false,
    error: null
  });

  // Handle URL query parameters
  useEffect(() => {
    const { q } = router.query;
    if (q && typeof q === 'string' && q !== searchTerm) {
      setSearchTerm(q);
      performSearch(q);
    }
  }, [router.query]);

  const performSearch = async (term: string) => {
    if (!term.trim()) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const results = await dictionaryService.searchWord(term);
      setState(prev => ({ ...prev, results }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Error searching dictionary'
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // Update URL with search term
    router.push({
      pathname: '/',
      query: { q: searchTerm }
    }, undefined, { shallow: true });

    await performSearch(searchTerm);
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear results if input is empty
    if (!value.trim()) {
      setState(prev => ({ ...prev, results: [], error: null }));
      // Remove query parameter when search is cleared
      router.push('/', undefined, { shallow: true });
    }
  }, [router]);

  const renderVocabularySection = (result: SearchResult) => {
    if (result.matchType !== 'exact' || !result.similarWords?.length) return null;

    return (
      <div className={styles.vocabularySection}>
        <h4 className={styles.vocabularyTitle}>Used in vocabulary</h4>
        {result.similarWords.slice(0, 5).map((similar, index) => (
          <div key={index} className={styles.vocabularyItem}>
            <span className={styles.vocabularyWord}>{similar.word}</span>
            {similar.reading && (
              <span className={styles.vocabularyReading}>【{similar.reading}】</span>
            )}
            <div className={styles.vocabularyMeaning}>
              {similar.meanings[0]}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderResult = (result: SearchResult) => {
    const { entry, matchType } = result;
    return (
      <div 
        className={`${styles.resultItem} ${matchType === 'exact' ? styles.exactMatch : ''}`} 
        key={`${entry.word}-${entry.reading}`}
      >
        <div className={styles.wordSection}>
          <div className={styles.verticalTextContainer}>
            {entry.reading && (
              <span className={styles.furigana}>{entry.reading}</span>
            )}
            <div className={styles.verticalText}>
              {entry.word}
            </div>
          </div>
        </div>
        <div className={styles.contentSection}>
          <div className={styles.meaningSection}>
            {entry.partOfSpeech && (
              <div className={styles.partOfSpeech}>
                {entry.partOfSpeech.join(', ')}
              </div>
            )}
            <ul className={styles.meanings}>
              {entry.meanings.map((meaning, index) => (
                <li key={index}>{meaning}</li>
              ))}
            </ul>
          </div>
          {renderVocabularySection(result)}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Japanese-English Dictionary
        </h1>

        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Enter Japanese or English word..."
            className={styles.searchInput}
            disabled={state.loading}
            autoFocus
          />
          <button 
            type="submit" 
            className={styles.searchButton}
            disabled={state.loading || !searchTerm.trim()}
          >
            {state.loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {state.error && (
          <div className={styles.error}>
            {state.error}
          </div>
        )}

        <div className={styles.results}>
          {state.results.length > 0 ? (
            <>
              <div className={styles.resultCount}>
                Found {state.results.length} result{state.results.length !== 1 ? 's' : ''}
              </div>
              {state.results.map((result, index) => renderResult(result))}
            </>
          ) : (
            searchTerm && !state.loading && (
              <div className={styles.noResults}>
                No results found for "{searchTerm}"
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
