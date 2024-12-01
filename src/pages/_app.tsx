import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Get theme from URL query parameter
    const theme = router.query.theme as string;
    
    // Set theme attribute on document
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [router.query.theme]); // Re-run effect when theme query param changes

  return <Component {...pageProps} />;
}

export default MyApp;
