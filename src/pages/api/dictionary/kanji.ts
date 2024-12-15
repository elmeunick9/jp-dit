import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';
import { kanjidict } from '../../../utils/kanjidict';
import { KanjiDamageEntry, KanjiDetail } from '@/types/kanji';

const filePath = path.join(process.cwd(), 'mnemonics.json');
const kanjiDamageFilePath = path.join(process.cwd(), 'src/dict/kanjidamage.json');

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
    const kanjiDamage = JSON.parse(fs.readFileSync(kanjiDamageFilePath, 'utf-8'));
    const kdEntry: KanjiDamageEntry|undefined = kanjiDamage[entry.literal];
    const components = kdEntry?.components || [];

    console.log(kdEntry)

    res.status(200).json({
        ...entry,
        relatedKanji: [
            ...components.map((c) => ({
                literal: c.literal,
                meanings: c.meaning?.split(', ') || [],
                readings: { onYomi: [], kunYomi: [] },
            })),
        ],
        mnemonic: mnemonics[entry.literal]?.trim() || kanjiDamage[entry.literal]?.mnemonic,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
