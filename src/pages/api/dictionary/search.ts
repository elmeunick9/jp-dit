import type { NextApiRequest, NextApiResponse } from 'next';
import { SearchResult } from '@/types/dictionary';
import { jmdict } from '@/utils/jmdict';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResult[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query;
  
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter required' });
  }

  try {
    // Initialize JMdict parser if not already initialized
    await jmdict.initialize();

    // Search the dictionary
    const entries = jmdict.search(q);

    // Convert to SearchResult format and determine match type
    const results: SearchResult[] = entries.map(entry => ({
      entry,
      matchType: (entry.word === q || entry.reading === q) ? 'exact' : 'partial'
    }));

    // Sort results: exact matches first, then by word length
    const sortedResults = results.sort((a, b) => {
      if (a.matchType === 'exact' && b.matchType !== 'exact') return -1;
      if (a.matchType !== 'exact' && b.matchType === 'exact') return 1;
      return a.entry.word.length - b.entry.word.length;
    });

    // Limit results to prevent overwhelming responses
    const limitedResults = sortedResults.slice(0, 50);

    res.status(200).json(limitedResults);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
