import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import KanjiDetails from '../components/KanjiDetails';
import { kanjiService } from '../services/kanjiService';
import { KanjiDetail } from '../types/kanji';
import styles from '../styles/Kanji.module.css';

const KanjiPage = () => {
  const router = useRouter();
  const { kanji } = router.query;

  const [kanjiData, setKanjiData] = useState<KanjiDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (kanji && typeof kanji === 'string') {
      (async () => {
        try {
          const data = await kanjiService.getKanjiDetails(kanji);
          setKanjiData(data);
        } catch (err) {
          setError('Failed to fetch kanji details.');
        }
      })();
    }
  }, [kanji]);

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!kanjiData) {
    return <div className={styles.loading}>Loading kanji details...</div>;
  }

  return (
    <div className={styles.container}>
      <KanjiDetails 
        kanji={kanjiData.kanji}
        onyomi={kanjiData.onyomi}
        kunyomi={kanjiData.kunyomi}
        similarKanji={kanjiData.similarKanji}
        mnemonic={kanjiData.mnemonic}
      />

    </div>
  );
};

export default KanjiPage;
