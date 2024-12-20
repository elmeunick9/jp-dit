import type { NextApiRequest, NextApiResponse } from 'next';
import { SearchResponse } from '../../../types/dictionary';
import { jmdict } from '../../../utils/jmdict';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query;
  
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter required' });
  }

  try {
    await jmdict.initialize();
    
    const startTime = Date.now();
    const results = jmdict.match(q);
    res.status(200).json({
      results, 
      time: Date.now() - startTime
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
