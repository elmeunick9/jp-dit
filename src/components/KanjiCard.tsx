import { KanjiDictEntry } from '../types/dictionary';
import styles from '../styles/KanjiCard.module.css';

interface KanjiCardProps {
  kanji: string;
  info: KanjiDictEntry;
  mini?: boolean;
}

export const KanjiCard = ({ kanji, info, mini = false }: KanjiCardProps) => {
  const themeMatch = new URLSearchParams(window.location.search).get('theme');
  const isDarkTheme = themeMatch === 'dark';

  const handleClick = () => {
    const newUrl = `http://localhost:3000/${encodeURIComponent(kanji)}?theme=${themeMatch || 'dark'}`;
    window.location.href = newUrl; // Redirect to the constructed URL
  };

  const useImage = kanji.startsWith("<img");
  const imgUrl = kanji.match(/src="\/([^"]+)"/)?.[1];
  const imgFullUrl = useImage ? `http://www.kanjidamage.com/${imgUrl}` : "";

  if (mini) {
    return (
      <div className={styles.miniCard} onClick={handleClick}>
        { useImage && <div className={styles.miniKanji}><img className={ isDarkTheme ? styles.miniKanjiImgDark : styles.miniKanjiImg } src={imgFullUrl} alt={kanji} /></div> }
        { !useImage && <div className={styles.miniKanji}>{kanji}</div> }
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
