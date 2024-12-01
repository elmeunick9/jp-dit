import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import styles from '../styles/Home.module.css';
import { dictionaryService } from '../services/dictionaryService';
import { DictionaryState } from '../types/dictionary';
import { SearchResultItem } from '../components/SearchResultItem';
import { JumpToWord } from '../components/JumpToWord';
import Translate from '@/components/translate';

const Home: NextPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [state, setState] = useState<DictionaryState>({
    response: undefined,
    loading: false,
    error: null
  });

  // Check if JumpToWord should be shown
  const shouldShowJumpToWord = state.response && state.response.results.length > 1 && 
    state.response.results.some(result => result.entry);

  const shouldShowResults = state.response && state.response.results.length > 0 &&
    state.response.results.some(result => result.entry);

  const shouldShowTranslation = state.response && state.response.results.length > 1 &&
    state.response.results.filter(result => result.entry).length > 1;

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
      const response = await dictionaryService.searchWord(term);
      setState(prev => ({ ...prev, response }));
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

    // Update URL with search term while preserving theme
    const query = { ...router.query, q: searchTerm };
    router.push({
      pathname: '/',
      query
    }, undefined, { shallow: true });

    await performSearch(searchTerm);
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear results if input is empty
    if (!value.trim()) {
      setState(prev => ({ ...prev, results: [], error: null }));
      // Remove search query while preserving theme
      const { theme } = router.query;
      const query = theme ? { theme } : {};
      router.push({
        pathname: '/',
        query
      }, undefined, { shallow: true });
    }
  }, [router]);

  return (
    <div className={styles.container}>
      <main className={`${styles.main} ${shouldShowJumpToWord ? styles.mainWithJumpToWord : ''}`}>
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
            aria-label="Search"
          >
            {state.loading ? '⏳' : '🔍'}
          </button>
        </form>

        {state.error && (
          <div className={styles.error}>
            {state.error}
          </div>
        )}

        { shouldShowTranslation && (
          <div className={styles.translation}>
            <div className={styles.translationTitle}>
              Machine Translation
            </div>
            <Translate text={searchTerm} />
          </div>
        )}
        

        <div className={styles.results}>
          {shouldShowResults ? (
            <>
              {state.response!.results.map((result, index) => (
                <div key={`${result.search}-${index}`} id={`word-${result.search}`}>
                  <SearchResultItem result={result} />
                </div>
              ))}
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
      {shouldShowJumpToWord && <JumpToWord results={state.response!.results} />}
    </div>
  );
};

export default Home;
