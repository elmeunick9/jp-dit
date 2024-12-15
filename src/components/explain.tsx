import { useEffect, useState } from 'react';
import { explainText } from '../utils/translate';
import ReactMarkdown from 'react-markdown';

interface ExplainProps {
  text: string; // The English text to be translated
}

const Explain: React.FC<ExplainProps> = ({ text }) => {
  const [explainedText, setExplainedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchExplanation = async () => {
      setIsLoading(true);
      setError('');
      try {
        const result = await explainText(text);
        setExplainedText(result);
      } catch (err) {
        setError('Failed to fetch explanation.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExplanation();
  }, [text]); // Re-run if the input text changes

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return <ReactMarkdown>{explainedText}</ReactMarkdown>;
};

export default Explain;
