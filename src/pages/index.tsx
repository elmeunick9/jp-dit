import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import styles from '../styles/Home.module.css';
import { dictionaryService } from '../services/dictionaryService';
import { DictionaryState } from '../types/dictionary';
import { SearchResultItem } from '../components/SearchResultItem';

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
              {state.results.map((result, index) => (
                <SearchResultItem key={`${result.search}-${index}`} result={result} />
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
    </div>
  );
};

export default Home;
