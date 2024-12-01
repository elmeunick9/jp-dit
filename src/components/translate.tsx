import { useEffect, useState } from 'react';
import { translateText } from '../utils/translate';

interface TranslateProps {
  text: string; // The English text to be translated
}

const Translate: React.FC<TranslateProps> = ({ text }) => {
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchTranslation = async () => {
      setIsLoading(true);
      setError('');
      try {
        const result = await translateText(text);
        setTranslatedText(result);
      } catch (err) {
        setError('Failed to fetch translation.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslation();
  }, [text]); // Re-run if the input text changes

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return <div>{translatedText}</div>;
};

export default Translate;
