import { KanjiDictEntry } from '../types/dictionary';
import styles from '../styles/KanjiCard.module.css';

interface KanjiCardProps {
  kanji: string;
  info: KanjiDictEntry;
  mini?: boolean;
}

export const KanjiCard = ({ kanji, info, mini = false }: KanjiCardProps) => {
  const handleClick = () => {
    const themeMatch = new URLSearchParams(window.location.search).get('theme');
    const newUrl = `http://localhost:3000/${encodeURIComponent(kanji)}?theme=${themeMatch || 'dark'}`;
    window.location.href = newUrl; // Redirect to the constructed URL
  };

  if (mini) {
    return (
      <div className={styles.miniCard} onClick={handleClick}>
        <span className={styles.miniKanji}>{kanji}</span>
        <span className={styles.miniMeanings}>
          {info.meanings.slice(0, 2).join(', ')}
        </span>
      </div>
    );
  }

  return (
    <div className={styles.card} onClick={handleClick}>
      <div className={styles.character}>{kanji}</div>
      {info.readings.onYomi.length > 0 && (
        <div className={styles.readings}>
          On: {info.readings.onYomi.join('、')}
        </div>
      )}
      {info.readings.kunYomi.length > 0 && (
        <div className={styles.readings}>
          Kun: {info.readings.kunYomi.join('、')}
        </div>
      )}
      <div className={styles.meanings}>
        {info.meanings.join(', ')}
      </div>
      {info.grade && (
        <div className={styles.grade}>
          Grade {info.grade}
        </div>
      )}
    </div>
  );
};
