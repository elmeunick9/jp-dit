import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';
import { kanjidict } from '../../../utils/kanjidict';
import { KanjiDetail } from '@/types/kanji';

const filePath = path.join(process.cwd(), 'mnemonics.json');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<KanjiDetail | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query;
  
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter required' });
  }

  try {
    await kanjidict.initialize();
    
    const entry = kanjidict.search(q);

    if (!entry) {
      return res.status(404).json({ error: 'Kanji not found' });
    }
    
    const mnemonics = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    res.status(200).json({
        ...entry,
        relatedKanji: [],
        mnemonic: mnemonics[entry.literal],
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
